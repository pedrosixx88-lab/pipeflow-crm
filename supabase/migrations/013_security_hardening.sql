-- ================================================================
-- 013 — Security Hardening
-- Remove p_user_id do accept_workspace_invite para usar auth.uid().
-- Isso evita que um usuário autenticado passe um user_id arbitrário
-- e aceite convites em nome de outro usuário.
-- ================================================================

create or replace function public.accept_workspace_invite(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_invite  public.workspace_invites%rowtype;
  v_count   integer;
  v_plan    public.workspace_plan;
begin
  if v_user_id is null then
    return jsonb_build_object('error', 'unauthenticated');
  end if;

  -- Valida formato do token (64 hex chars)
  if p_token !~ '^[a-f0-9]{64}$' then
    return jsonb_build_object('error', 'invite_invalid_or_expired');
  end if;

  -- Busca o convite válido
  select * into v_invite
  from   public.workspace_invites
  where  token       = p_token
    and  accepted_at is null
    and  expires_at  > now();

  if not found then
    return jsonb_build_object('error', 'invite_invalid_or_expired');
  end if;

  -- Verifica limite do plano Free (máximo 2 membros ativos)
  select plan into v_plan
  from   public.workspaces
  where  id = v_invite.workspace_id;

  if v_plan = 'free' then
    select count(*) into v_count
    from   public.workspace_members
    where  workspace_id = v_invite.workspace_id
      and  status       = 'active';

    if v_count >= 2 then
      return jsonb_build_object('error', 'member_limit_reached');
    end if;
  end if;

  -- Verifica se o usuário já é membro
  if exists (
    select 1 from public.workspace_members
    where  workspace_id = v_invite.workspace_id
      and  user_id      = v_user_id
  ) then
    update public.workspace_invites
    set    accepted_at = now()
    where  id = v_invite.id;

    return jsonb_build_object('workspace_id', v_invite.workspace_id, 'already_member', true);
  end if;

  -- Cria membro ativo
  insert into public.workspace_members (workspace_id, user_id, role, invited_email, status)
  values (v_invite.workspace_id, v_user_id, v_invite.role, v_invite.email, 'active');

  -- Marca invite como aceito
  update public.workspace_invites
  set    accepted_at = now()
  where  id = v_invite.id;

  return jsonb_build_object('workspace_id', v_invite.workspace_id);
end;
$$;
