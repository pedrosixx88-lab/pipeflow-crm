-- ================================================================
-- Patch 001 — Corrige RLS performance, trigger e remove owner_id
-- Baseado em: supabase-postgres-best-practices/security-rls-performance
-- ================================================================

-- ----------------------------------------------------------------
-- 1. Remove owner_id de workspaces (coluna obsoleta)
-- ----------------------------------------------------------------
alter table public.workspaces drop column if exists owner_id;

-- ----------------------------------------------------------------
-- 2. Índice composto para o padrão mais frequente de RLS
--    (user_id + status) — cobre my_workspace_ids() e todas as
--    subqueries de admin inline
-- ----------------------------------------------------------------
create index if not exists workspace_members_user_status_idx
  on public.workspace_members (user_id, status);

-- ----------------------------------------------------------------
-- 3. Corrige my_workspace_ids() — (select auth.uid()) avaliado
--    uma vez por query, não por linha
-- ----------------------------------------------------------------
create or replace function public.my_workspace_ids()
returns setof uuid language sql security definer stable as $$
  select workspace_id
  from   public.workspace_members
  where  user_id = (select auth.uid())
    and  status  = 'active';
$$;

-- ----------------------------------------------------------------
-- 4. Corrige trigger handle_new_workspace — usava new.owner_id
--    (coluna removida). Agora usa auth.uid() diretamente, que
--    está disponível no contexto da transação do usuário.
-- ----------------------------------------------------------------
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

-- ----------------------------------------------------------------
-- 5. Policies de profiles — auth.uid() → (select auth.uid())
-- ----------------------------------------------------------------
drop policy if exists "profiles: leitura do próprio perfil"    on public.profiles;
drop policy if exists "profiles: atualização do próprio perfil" on public.profiles;

create policy "profiles: leitura do próprio perfil"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "profiles: atualização do próprio perfil"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ----------------------------------------------------------------
-- 6. Policy de subscriptions — auth.uid() → (select auth.uid())
-- ----------------------------------------------------------------
drop policy if exists "subscriptions: leitura por admin do workspace" on public.subscriptions;

create policy "subscriptions: leitura por admin do workspace"
  on public.subscriptions for select
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = (select auth.uid())
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- ----------------------------------------------------------------
-- 7. Policies de workspace_members — auth.uid() → (select auth.uid())
--    e renomeia insert policy para nome correto
-- ----------------------------------------------------------------
drop policy if exists "workspace_members: inserção por admin ou próprio usuário" on public.workspace_members;
drop policy if exists "workspace_members: inserção por admin"   on public.workspace_members;
drop policy if exists "workspace_members: atualização por admin" on public.workspace_members;
drop policy if exists "workspace_members: remoção por admin"     on public.workspace_members;

create policy "workspace_members: inserção por admin"
  on public.workspace_members for insert
  with check (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = (select auth.uid())
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

create policy "workspace_members: atualização por admin"
  on public.workspace_members for update
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = (select auth.uid())
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

create policy "workspace_members: remoção por admin"
  on public.workspace_members for delete
  using (
    workspace_id in (
      select workspace_id from public.workspace_members
      where  user_id = (select auth.uid())
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- ----------------------------------------------------------------
-- 8. Policies de workspaces — auth.uid() → (select auth.uid())
-- ----------------------------------------------------------------
drop policy if exists "workspaces: atualização por admin"           on public.workspaces;
drop policy if exists "workspaces: criação livre (usuário autenticado)" on public.workspaces;

create policy "workspaces: criação livre (usuário autenticado)"
  on public.workspaces for insert
  with check ((select auth.uid()) is not null);

create policy "workspaces: atualização por admin"
  on public.workspaces for update
  using (
    id in (
      select workspace_id from public.workspace_members
      where  user_id = (select auth.uid())
        and  role    = 'admin'
        and  status  = 'active'
    )
  );

-- ----------------------------------------------------------------
-- Verificação final
-- ----------------------------------------------------------------
select
  p.tablename,
  p.policyname,
  p.cmd,
  case
    when p.qual  like '%auth.uid()%' and p.qual  not like '%(select auth.uid())%' then 'AINDA SEM (select)'
    when p.with_check like '%auth.uid()%' and p.with_check not like '%(select auth.uid())%' then 'AINDA SEM (select) em WITH CHECK'
    else 'OK'
  end as status
from pg_policies p
where p.schemaname = 'public'
order by p.tablename, p.policyname;
