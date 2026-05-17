-- Adiciona o valor 'payment_failed' ao enum workspace_plan
-- Necessário para marcar workspaces com falha no pagamento sem derrubar o plano Pro imediatamente

alter type public.workspace_plan add value if not exists 'payment_failed';

-- workspaces: CHECK constraint para garantir valores válidos de plan
alter table public.workspaces
  add constraint workspaces_plan_check
  check (plan in ('free', 'pro', 'payment_failed'));
