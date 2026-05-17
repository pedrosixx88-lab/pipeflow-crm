-- ================================================================
-- Patch 002 — Adiciona TO authenticated em todas as policies
-- O role 'public' não inclui usuários autenticados via JWT no Supabase.
-- Policies sem TO authenticated não se aplicam a usuários logados.
-- ================================================================

-- workspaces
DROP POLICY IF EXISTS "workspaces: criação livre (usuário autenticado)" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces: leitura para membros ativos"          ON public.workspaces;
DROP POLICY IF EXISTS "workspaces: atualização por admin"                ON public.workspaces;

CREATE POLICY "workspaces: leitura para membros ativos"
  ON public.workspaces FOR SELECT TO authenticated
  USING (id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "workspaces: criação livre (usuário autenticado)"
  ON public.workspaces FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "workspaces: atualização por admin"
  ON public.workspaces FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- workspace_members
DROP POLICY IF EXISTS "workspace_members: leitura para membros do workspace" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members: inserção por admin"                ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members: atualização por admin"             ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members: remoção por admin"                 ON public.workspace_members;

CREATE POLICY "workspace_members: leitura para membros do workspace"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "workspace_members: inserção por admin"
  ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "workspace_members: atualização por admin"
  ON public.workspace_members FOR UPDATE TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

CREATE POLICY "workspace_members: remoção por admin"
  ON public.workspace_members FOR DELETE TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- profiles
DROP POLICY IF EXISTS "profiles: leitura do próprio perfil"     ON public.profiles;
DROP POLICY IF EXISTS "profiles: atualização do próprio perfil" ON public.profiles;

CREATE POLICY "profiles: leitura do próprio perfil"
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "profiles: atualização do próprio perfil"
  ON public.profiles FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- leads
DROP POLICY IF EXISTS "leads: leitura para membros do workspace"     ON public.leads;
DROP POLICY IF EXISTS "leads: criação para membros do workspace"      ON public.leads;
DROP POLICY IF EXISTS "leads: atualização para membros do workspace"  ON public.leads;
DROP POLICY IF EXISTS "leads: exclusão para membros do workspace"     ON public.leads;

CREATE POLICY "leads: leitura para membros do workspace"
  ON public.leads FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "leads: criação para membros do workspace"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "leads: atualização para membros do workspace"
  ON public.leads FOR UPDATE TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "leads: exclusão para membros do workspace"
  ON public.leads FOR DELETE TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

-- deals
DROP POLICY IF EXISTS "deals: leitura para membros do workspace"    ON public.deals;
DROP POLICY IF EXISTS "deals: criação para membros do workspace"     ON public.deals;
DROP POLICY IF EXISTS "deals: atualização para membros do workspace" ON public.deals;
DROP POLICY IF EXISTS "deals: exclusão para membros do workspace"    ON public.deals;

CREATE POLICY "deals: leitura para membros do workspace"
  ON public.deals FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "deals: criação para membros do workspace"
  ON public.deals FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "deals: atualização para membros do workspace"
  ON public.deals FOR UPDATE TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "deals: exclusão para membros do workspace"
  ON public.deals FOR DELETE TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

-- activities
DROP POLICY IF EXISTS "activities: leitura para membros do workspace"    ON public.activities;
DROP POLICY IF EXISTS "activities: criação para membros do workspace"     ON public.activities;
DROP POLICY IF EXISTS "activities: atualização para membros do workspace" ON public.activities;
DROP POLICY IF EXISTS "activities: exclusão para membros do workspace"    ON public.activities;

CREATE POLICY "activities: leitura para membros do workspace"
  ON public.activities FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "activities: criação para membros do workspace"
  ON public.activities FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "activities: atualização para membros do workspace"
  ON public.activities FOR UPDATE TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "activities: exclusão para membros do workspace"
  ON public.activities FOR DELETE TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

-- subscriptions
DROP POLICY IF EXISTS "subscriptions: leitura por admin do workspace" ON public.subscriptions;

CREATE POLICY "subscriptions: leitura por admin do workspace"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- Verificação: todas as policies devem ter 'authenticated' nos roles
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
