import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { WorkspaceSettingsClient, type MemberWithProfile } from "@/components/settings/workspace-settings-client";
import type { WorkspaceInviteRow, WorkspaceRow } from "@/types/database";

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
      .eq("status", "active")
      .order("created_at", { ascending: true }),

    supabase
      .from("workspace_invites")
      .select("id, workspace_id, invited_by, email, role, token, expires_at, accepted_at, created_at")
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
  const invites = (invitesRes.data ?? []) as WorkspaceInviteRow[];
  const rawMembers = membersRes.data ?? [];
  const isAdmin = !!isAdminRes.data;

  // Busca profiles dos membros que têm user_id (evita join PostgREST com FK não declarada)
  const userIds = rawMembers.map((m) => m.user_id).filter(Boolean) as string[];
  const profilesMap: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);
    for (const p of profilesData ?? []) {
      profilesMap[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
    }
  }

  const members: MemberWithProfile[] = rawMembers.map((m) => ({
    ...m,
    role: m.role as "admin" | "member",
    status: m.status as "active" | "pending",
    profiles: m.user_id ? (profilesMap[m.user_id] ?? null) : null,
  }));

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
