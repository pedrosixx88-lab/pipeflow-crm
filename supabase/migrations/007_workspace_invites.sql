-- ================================================================
-- 007 — Workspace Invites
-- Token-based invite system para colaboração por e-mail.
-- Execute após 006_subscriptions.sql em banco limpo,
-- ou cole no SQL Editor do Supabase Studio.
-- ================================================================

create table if not exists public.workspace_invites (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces (id) on delete cascade,
  invited_by    uuid not null references auth.users (id) on delete cascade,
  email         text not null,
  role          public.member_role not null default 'member',
  token         text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at    timestamptz not null default (now() + interval '7 days'),
  accepted_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index workspace_invites_workspace_id_idx on public.workspace_invites (workspace_id);
create index workspace_invites_token_idx        on public.workspace_invites (token);
create index workspace_invites_email_idx        on public.workspace_invites (email);

-- RLS
alter table public.workspace_invites enable row level security;

-- Admins do workspace veem os convites pendentes
create policy "workspace_invites: leitura por admin"
  on public.workspace_invites for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- Admins criam convites
create policy "workspace_invites: criação por admin"
  on public.workspace_invites for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- Admins podem revogar convites (delete)
create policy "workspace_invites: revogação por admin"
  on public.workspace_invites for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = auth.uid()
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- A função de aceite roda como security definer e atualiza o invite.
-- Usuário anônimo (não logado) não precisa de SELECT policy — o aceite
-- é feito via Server Action com service_role ou via função abaixo.

-- Função pública para aceitar um convite pelo token (executada via RPC).
-- Valida token, expiração, cria membro ativo e marca o invite como aceito.
create or replace function public.accept_workspace_invite(p_token text, p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_invite  public.workspace_invites%rowtype;
  v_count   integer;
  v_plan    public.workspace_plan;
begin
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
      and  user_id      = p_user_id
  ) then
    -- Já é membro: apenas marca o invite como aceito
    update public.workspace_invites
    set    accepted_at = now()
    where  id = v_invite.id;

    return jsonb_build_object('workspace_id', v_invite.workspace_id, 'already_member', true);
  end if;

  -- Cria membro ativo
  insert into public.workspace_members (workspace_id, user_id, role, invited_email, status)
  values (v_invite.workspace_id, p_user_id, v_invite.role, v_invite.email, 'active');

  -- Marca invite como aceito
  update public.workspace_invites
  set    accepted_at = now()
  where  id = v_invite.id;

  return jsonb_build_object('workspace_id', v_invite.workspace_id);
end;
$$;
