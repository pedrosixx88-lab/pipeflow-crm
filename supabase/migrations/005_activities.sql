-- ============================================================
-- 005_activities.sql — Atividades / Timeline do lead
-- Registra interações: ligação, e-mail, reunião, nota.
-- ============================================================

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

-- ── RLS ──────────────────────────────────────────────────────

alter table public.activities enable row level security;

create policy "activities: leitura para membros do workspace"
  on public.activities for select
  using (workspace_id in (select public.my_workspace_ids()));

create policy "activities: criação para membros do workspace"
  on public.activities for insert
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "activities: atualização para membros do workspace"
  on public.activities for update
  using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));

create policy "activities: exclusão para membros do workspace"
  on public.activities for delete
  using (workspace_id in (select public.my_workspace_ids()));
