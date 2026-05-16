-- ============================================================
-- 006_subscriptions.sql — Histórico de assinaturas Stripe
-- Rastreia cada período de assinatura do workspace.
-- O plano ativo fica em workspaces.plan para leitura rápida.
-- ============================================================

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

-- ── Função auxiliar: sincroniza workspaces.plan após upsert ──

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

-- ── RLS ──────────────────────────────────────────────────────
-- Apenas admins do workspace veem dados de cobrança.

alter table public.subscriptions enable row level security;

create policy "subscriptions: leitura por admin do workspace"
  on public.subscriptions for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- Escrita feita exclusivamente por service_role (webhook Stripe).
-- Nenhuma policy de insert/update/delete para anon/authenticated.
