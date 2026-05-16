-- ============================================================
-- 003_leads.sql — Leads / Contatos
-- Isolados por workspace via RLS.
-- ============================================================

create type public.lead_status as enum (
  'novo',
  'contatado',
  'qualificado',
  'perdido',
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

-- ── RLS ──────────────────────────────────────────────────────

alter table public.leads enable row level security;

create policy "leads: leitura para membros do workspace"
  on public.leads for select
  using (workspace_id in (select public.my_workspace_ids()));

create policy "leads: criação para membros do workspace"
  on public.leads for insert
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "leads: atualização para membros do workspace"
  on public.leads for update
  using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "leads: exclusão para membros do workspace"
  on public.leads for delete
  using (workspace_id in (select public.my_workspace_ids()));
