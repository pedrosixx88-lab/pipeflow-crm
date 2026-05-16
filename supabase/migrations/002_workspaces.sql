-- ============================================================
-- 002_workspaces.sql — Workspaces e membros
-- Cada workspace é uma empresa/time isolado.
-- workspace_members controla quem pertence a qual workspace.
-- ============================================================

create type public.workspace_plan as enum ('free', 'pro');
create type public.member_role   as enum ('admin', 'member');
create type public.member_status as enum ('active', 'pending');

-- ── Workspaces ───────────────────────────────────────────────

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

-- ── Membros ──────────────────────────────────────────────────

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

-- ── Função auxiliar de RLS ───────────────────────────────────
-- Retorna os IDs de workspace onde o usuário logado é membro ativo.
create or replace function public.my_workspace_ids()
returns setof uuid language sql security definer stable as $$
  select workspace_id
  from   public.workspace_members
  where  user_id = auth.uid()
    and  status  = 'active';
$$;

-- ── RLS — workspaces ─────────────────────────────────────────

alter table public.workspaces enable row level security;

create policy "workspaces: leitura para membros ativos"
  on public.workspaces for select
  using (id in (select public.my_workspace_ids()));

create policy "workspaces: criação livre (usuário autenticado)"
  on public.workspaces for insert
  with check (auth.uid() is not null);

create policy "workspaces: atualização por admin"
  on public.workspaces for update
  using (
    id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- ── RLS — workspace_members ──────────────────────────────────

alter table public.workspace_members enable row level security;

create policy "workspace_members: leitura para membros do workspace"
  on public.workspace_members for select
  using (workspace_id in (select public.my_workspace_ids()));

create policy "workspace_members: inserção por admin"
  on public.workspace_members for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
    -- ou o próprio usuário aceita convite (user_id = auth.uid())
    or user_id = auth.uid()
  );

create policy "workspace_members: atualização por admin"
  on public.workspace_members for update
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

create policy "workspace_members: remoção por admin"
  on public.workspace_members for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- ── Trigger: criar workspace cria membro admin automaticamente ──

create or replace function public.handle_new_workspace()
returns trigger language plpgsql security definer as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new.id, auth.uid(), 'admin', 'active');
  return new;
end;
$$;

create trigger on_workspace_created
  after insert on public.workspaces
  for each row execute function public.handle_new_workspace();
