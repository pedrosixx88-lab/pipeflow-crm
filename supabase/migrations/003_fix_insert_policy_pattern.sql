-- ================================================================
-- Patch 003 — Fix FOR INSERT policies across all tables
-- Root cause: PostgreSQL FOR INSERT ... WITH CHECK does not work
-- correctly in Supabase PostgREST context. The working pattern is
-- FOR ALL USING (true) WITH CHECK (condition), which covers INSERT,
-- UPDATE, and DELETE while SELECT is handled by a separate policy.
-- ================================================================

-- workspaces: already fixed manually on remote, replicate here for consistency
-- Uses dynamic drop to avoid encoding issues with non-ASCII policy names
DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'workspaces' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY %I ON public.workspaces', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "workspaces_select" ON public.workspaces
  FOR SELECT TO authenticated
  USING (id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "workspaces_insert_update_delete" ON public.workspaces
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

CREATE POLICY "workspaces_update_admin" ON public.workspaces
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = (SELECT auth.uid()) AND role = 'admin' AND status = 'active'
    )
  );

-- workspace_members
DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'workspace_members' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY %I ON public.workspace_members', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "workspace_members_select" ON public.workspace_members
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "workspace_members_write" ON public.workspace_members
  FOR ALL TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members wm
      WHERE wm.user_id = (SELECT auth.uid()) AND wm.role = 'admin' AND wm.status = 'active'
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members wm
      WHERE wm.user_id = (SELECT auth.uid()) AND wm.role = 'admin' AND wm.status = 'active'
    )
  );

-- leads
DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'leads' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY %I ON public.leads', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "leads_select" ON public.leads
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "leads_write" ON public.leads
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

-- deals
DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'deals' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY %I ON public.deals', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "deals_select" ON public.deals
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "deals_write" ON public.deals
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

-- activities
DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'activities' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY %I ON public.activities', pol.polname);
  END LOOP;
END $$;

CREATE POLICY "activities_select" ON public.activities
  FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()));

CREATE POLICY "activities_write" ON public.activities
  FOR ALL TO authenticated
  USING (workspace_id IN (SELECT public.my_workspace_ids()))
  WITH CHECK (workspace_id IN (SELECT public.my_workspace_ids()));

-- Verify final state
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
