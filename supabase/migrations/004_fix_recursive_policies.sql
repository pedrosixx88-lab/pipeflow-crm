-- ================================================================
-- Patch 004 — Fix infinite recursion in workspace_members policies
-- Root cause: workspace_members_write policy references the same
-- table (workspace_members) causing infinite recursion under RLS.
-- Fix: use security definer helper functions that bypass RLS.
--
-- Also applies Supabase best practices (skill: security-rls-performance):
-- - security definer functions for complex RLS checks
-- - (select auth.uid()) cached once per query
-- - indexes on all RLS-queried columns
-- ================================================================

-- Helper: returns workspace IDs where current user is active ADMIN
-- security definer bypasses RLS, breaking the recursion loop
create or replace function public.my_admin_workspace_ids()
returns setof uuid language sql security definer stable as $$
  select workspace_id
  from   public.workspace_members
  where  user_id = (select auth.uid())
    and  role    = 'admin'
    and  status  = 'active';
$$;

-- ── workspace_members ─────────────────────────────────────────

-- Drop and recreate to avoid recursion
DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'workspace_members' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY %I ON public.workspace_members', pol.polname);
  END LOOP;
END $$;

-- SELECT: use my_workspace_ids() — security definer, no recursion
create policy "workspace_members_select"
  on public.workspace_members for select to authenticated
  using (workspace_id in (select public.my_workspace_ids()));

-- INSERT/UPDATE/DELETE: use my_admin_workspace_ids() — security definer, no recursion
create policy "workspace_members_write"
  on public.workspace_members for all to authenticated
  using (workspace_id in (select public.my_admin_workspace_ids()))
  with check (workspace_id in (select public.my_admin_workspace_ids()));

-- ── subscriptions ──────────────────────────────────────────────

DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'subscriptions' AND c.relnamespace = 'public'::regnamespace
  LOOP
    EXECUTE format('DROP POLICY %I ON public.subscriptions', pol.polname);
  END LOOP;
END $$;

create policy "subscriptions_select"
  on public.subscriptions for select to authenticated
  using (workspace_id in (select public.my_admin_workspace_ids()));

-- ── workspaces: tighten update policy ─────────────────────────

DO $$ DECLARE pol record; BEGIN
  FOR pol IN SELECT p.polname FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    WHERE c.relname = 'workspaces' AND c.relnamespace = 'public'::regnamespace
      AND p.polcmd = 'w'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.workspaces', pol.polname);
  END LOOP;
END $$;

create policy "workspaces_update_admin"
  on public.workspaces for update to authenticated
  using (id in (select public.my_admin_workspace_ids()));

-- ── Ensure indexes exist for RLS helper functions (skill: query-missing-indexes) ──

-- workspace_members: composite index for the two helper functions
-- my_workspace_ids() queries: user_id + status
-- my_admin_workspace_ids() queries: user_id + role + status
create index if not exists workspace_members_user_status_idx
  on public.workspace_members (user_id, status);

create index if not exists workspace_members_user_role_status_idx
  on public.workspace_members (user_id, role, status)
  where status = 'active';

-- Verification
select tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
