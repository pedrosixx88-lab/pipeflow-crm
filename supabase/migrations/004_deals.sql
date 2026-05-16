-- ============================================================
-- 004_deals.sql — Negócios do Pipeline Kanban
-- Cada deal pertence a um workspace e pode estar vinculado a um lead.
-- position controla a ordem dentro de cada coluna.
-- ============================================================

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

-- ── RLS ──────────────────────────────────────────────────────

alter table public.deals enable row level security;

create policy "deals: leitura para membros do workspace"
  on public.deals for select
  using (workspace_id in (select public.my_workspace_ids()));

create policy "deals: criação para membros do workspace"
  on public.deals for insert
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "deals: atualização para membros do workspace"
  on public.deals for update
  using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "deals: exclusão para membros do workspace"
  on public.deals for delete
  using (workspace_id in (select public.my_workspace_ids()));
