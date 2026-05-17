-- Adiciona o valor 'payment_failed' ao enum workspace_plan
-- Necessário para marcar workspaces com falha no pagamento sem derrubar o plano Pro imediatamente

alter type public.workspace_plan add value if not exists 'payment_failed';
