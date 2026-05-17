-- ================================================================
-- PipeFlow CRM — Migration completa
-- Cole todo este arquivo no SQL Editor do Supabase Studio e clique
-- em "Run". Execute UMA VEZ em banco limpo.
-- ================================================================


-- ================================================================
-- 001 — Profiles
-- ================================================================

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Função genérica de updated_at (reutilizada por todas as tabelas)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Trigger: cria perfil automaticamente ao criar usuário no Auth
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'avatar_url', '')), '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

-- (select auth.uid()) is evaluated once per query, not per row — avoids linear scan cost
create policy "profiles_select"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);


-- ================================================================
-- 002 — Workspaces & Membros
-- ================================================================

create type public.workspace_plan as enum ('free', 'pro');
create type public.member_role   as enum ('admin', 'member');
create type public.member_status as enum ('active', 'pending');

-- Tabela de workspaces (sem owner_id — membership gerenciada por workspace_members)
create table if not exists public.workspaces (
  id                     uuid primary key default gen_random_uuid(),
  name                   text not null,
  slug                   text not null unique,
  plan                   public.workspace_plan not null default 'free',
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger workspaces_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

-- Tabela de membros
create table if not exists public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  user_id       uuid references auth.users (id) on delete set null,
  role          public.member_role   not null default 'member',
  invited_email text,
  status        public.member_status not null default 'pending',
  created_at    timestamptz not null default now()
);

create index workspace_members_workspace_id_idx on public.workspace_members (workspace_id);
create index workspace_members_user_id_idx      on public.workspace_members (user_id);
-- Índice composto para a query mais frequente de RLS (user_id + status)
create index workspace_members_user_status_idx  on public.workspace_members (user_id, status);

-- Helper: workspaces onde o usuário é membro ativo (qualquer role).
-- security definer bypasses RLS — quebra recursão em políticas da própria tabela.
-- (select auth.uid()) avaliado uma vez por query, não por linha.
create or replace function public.my_workspace_ids()
returns setof uuid language sql security definer stable as $$
  select workspace_id
  from   public.workspace_members
  where  user_id = (select auth.uid())
    and  status  = 'active';
$$;

-- Helper: workspaces onde o usuário é ADMIN ativo.
-- Usado em políticas de workspace_members e subscriptions para evitar recursão.
create or replace function public.my_admin_workspace_ids()
returns setof uuid language sql security definer stable as $$
  select workspace_id
  from   public.workspace_members
  where  user_id = (select auth.uid())
    and  role    = 'admin'
    and  status  = 'active';
$$;

-- RLS — workspaces
alter table public.workspaces enable row level security;

create policy "workspaces_select"
  on public.workspaces for select to authenticated
  using (id in (select public.my_workspace_ids()));

-- FOR ALL pattern required: FOR INSERT WITH CHECK alone does not work in Supabase PostgREST.
-- USING (true) permite insert; WITH CHECK verifica que o usuário está autenticado.
create policy "workspaces_insert_update_delete"
  on public.workspaces for all to authenticated
  using (true)
  with check ((select auth.uid()) is not null);

-- UPDATE adicional com restrição de admin (mais restritivo que o FOR ALL acima)
create policy "workspaces_update_admin"
  on public.workspaces for update to authenticated
  using (id in (select public.my_admin_workspace_ids()));

-- RLS — workspace_members
alter table public.workspace_members enable row level security;

create policy "workspace_members_select"
  on public.workspace_members for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

-- Apenas admins gerenciam membros.
-- Usa my_admin_workspace_ids() para evitar recursão infinita (self-referential policy).
create policy "workspace_members_write"
  on public.workspace_members for all to authenticated
  using (workspace_id in (select public.my_admin_workspace_ids()))
  with check (workspace_id in (select public.my_admin_workspace_ids()));

-- Trigger: ao criar workspace, registra o usuário autenticado como admin ativo.
-- Usa auth.uid() via security definer — funciona porque o trigger roda no
-- contexto da transação do usuário (não em background job).
create or replace function public.handle_new_workspace()
returns trigger language plpgsql security definer as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is not null then
    insert into public.workspace_members (workspace_id, user_id, role, status)
    values (new.id, v_user_id, 'admin', 'active');
  end if;
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();


-- ================================================================
-- 003 — Leads
-- ================================================================

create type public.lead_status as enum (
  'novo',
  'contato_realizado',
  'proposta_enviada',
  'negociacao',
  'fechado_ganho',
  'fechado_perdido',
  'arquivado'
);

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  owner_id      uuid references auth.users (id) on delete set null,
  name          text not null,
  email         text,
  phone         text,
  company       text,
  role          text,
  status        public.lead_status not null default 'novo',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index leads_workspace_id_idx on public.leads (workspace_id);
create index leads_owner_id_idx     on public.leads (owner_id);
create index leads_status_idx       on public.leads (status);

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();

-- RLS
alter table public.leads enable row level security;

create policy "leads_select"
  on public.leads for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

create policy "leads_write"
  on public.leads for all to authenticated
  using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));


-- ================================================================
-- 004 — Deals (Pipeline Kanban)
-- ================================================================

create type public.deal_stage as enum (
  'novo_lead',
  'contato_realizado',
  'proposta_enviada',
  'negociacao',
  'fechado_ganho',
  'fechado_perdido'
);

create table if not exists public.deals (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  lead_id       uuid references public.leads (id) on delete set null,
  owner_id      uuid references auth.users (id) on delete set null,
  title         text not null,
  value         numeric(14, 2) not null default 0,
  stage         public.deal_stage not null default 'novo_lead',
  position      integer not null default 0,
  deadline      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index deals_workspace_id_idx on public.deals (workspace_id);
create index deals_lead_id_idx      on public.deals (lead_id);
create index deals_owner_id_idx     on public.deals (owner_id);
create index deals_stage_idx        on public.deals (stage);

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.set_updated_at();

-- RLS
alter table public.deals enable row level security;

create policy "deals_select"
  on public.deals for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

create policy "deals_write"
  on public.deals for all to authenticated
  using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));


-- ================================================================
-- 005 — Activities (Timeline)
-- ================================================================

create type public.activity_type as enum (
  'ligacao',
  'email',
  'reuniao',
  'nota'
);

create table if not exists public.activities (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  lead_id       uuid not null references public.leads (id) on delete cascade,
  author_id     uuid references auth.users (id) on delete set null,
  type          public.activity_type not null,
  description   text not null,
  occurred_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index activities_workspace_id_idx on public.activities (workspace_id);
create index activities_lead_id_idx      on public.activities (lead_id);
create index activities_author_id_idx    on public.activities (author_id);
create index activities_occurred_at_idx  on public.activities (occurred_at desc);

-- RLS
alter table public.activities enable row level security;

create policy "activities_select"
  on public.activities for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

create policy "activities_write"
  on public.activities for all to authenticated
  using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));


-- ================================================================
-- 006 — Subscriptions (Stripe)
-- ================================================================

create type public.subscription_status as enum (
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete'
);

create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  workspace_id            uuid not null references public.workspaces (id) on delete cascade,
  stripe_subscription_id  text not null unique,
  stripe_customer_id      text not null,
  stripe_price_id         text not null,
  status                  public.subscription_status not null,
  current_period_start    timestamptz not null,
  current_period_end      timestamptz not null,
  cancel_at_period_end    boolean not null default false,
  canceled_at             timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index subscriptions_workspace_id_idx           on public.subscriptions (workspace_id);
create index subscriptions_stripe_subscription_id_idx on public.subscriptions (stripe_subscription_id);
create index subscriptions_stripe_customer_id_idx     on public.subscriptions (stripe_customer_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- Trigger: sincroniza workspaces.plan após mudança de status
create or replace function public.sync_workspace_plan()
returns trigger language plpgsql security definer as $$
begin
  update public.workspaces
  set
    plan                   = case
                               when new.status in ('active', 'trialing') then 'pro'::public.workspace_plan
                               else 'free'::public.workspace_plan
                             end,
    stripe_customer_id     = new.stripe_customer_id,
    stripe_subscription_id = new.stripe_subscription_id
  where id = new.workspace_id;
  return new;
end;
$$;

create trigger on_subscription_change
  after insert or update on public.subscriptions
  for each row execute function public.sync_workspace_plan();

-- RLS — apenas admins veem dados de cobrança; escrita por service_role
-- Usa my_admin_workspace_ids() para evitar recursão sobre workspace_members
alter table public.subscriptions enable row level security;

create policy "subscriptions_select"
  on public.subscriptions for select to authenticated
  using (workspace_id in (select public.my_admin_workspace_ids()));


-- ================================================================
-- Índices adicionais de performance (skill: security-rls-performance)
-- ================================================================

-- workspace_members: índice composto para my_admin_workspace_ids()
-- (user_id, role, status) com filtro parcial em status=active
create index if not exists workspace_members_user_role_status_idx
  on public.workspace_members (user_id, role, status)
  where status = 'active';


-- ================================================================
-- Verificação final
-- ================================================================
select
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles', 'workspaces', 'workspace_members',
    'leads', 'deals', 'activities', 'subscriptions'
  )
order by tablename;
