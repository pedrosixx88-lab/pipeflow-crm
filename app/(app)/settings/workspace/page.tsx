import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { WorkspaceSettingsClient } from "@/components/settings/workspace-settings-client";
import type { WorkspaceMemberRow, WorkspaceInviteRow, WorkspaceRow } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function WorkspaceSettingsPage() {
  const supabase = asTyped(await createClient());
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  if (!user) redirect("/login");

  // Workspace ativo do cookie (ou primeiro)
  const cookieStore = await import("next/headers").then((m) => m.cookies());
  const workspaceId = cookieStore.get("pf_workspace_id")?.value;

  // Resolve o workspace_id ativo
  let activeWorkspaceId: string | undefined = workspaceId;
  if (!activeWorkspaceId) {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    activeWorkspaceId = data?.workspace_id ?? undefined;
  }

  if (!activeWorkspaceId) redirect("/dashboard");

  // Dados em paralelo
  const [workspaceRes, membersRes, invitesRes, isAdminRes] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, name, slug, plan")
      .eq("id", activeWorkspaceId)
      .single(),

    supabase
      .from("workspace_members")
      .select("id, workspace_id, user_id, role, invited_email, status, created_at")
      .eq("workspace_id", activeWorkspaceId)
      .order("created_at", { ascending: true }),

    supabase
      .from("workspace_invites")
      .select("id, workspace_id, invited_by, email, role, expires_at, accepted_at, created_at")
      .eq("workspace_id", activeWorkspaceId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),

    supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", activeWorkspaceId)
      .eq("user_id", user.id)
      .eq("role", "admin")
      .eq("status", "active")
      .single(),
  ]);

  const workspace = workspaceRes.data as WorkspaceRow | null;
  const members = (membersRes.data ?? []) as WorkspaceMemberRow[];
  const invites = (invitesRes.data ?? []) as WorkspaceInviteRow[];
  const isAdmin = !!isAdminRes.data;

  if (!workspace) redirect("/dashboard");

  return (
    <WorkspaceSettingsClient
      workspace={workspace}
      members={members}
      invites={invites}
      currentUserId={user.id}
      isAdmin={isAdmin}
    />
  );
}
