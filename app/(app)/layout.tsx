import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import type { SidebarUser, SidebarWorkspace } from "@/components/shared/sidebar";
import type { ProfileRow, WorkspaceRow, WorkspaceMemberRow } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Busca perfil e memberships em paralelo
  const [profileResult, memberResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, onboarded")
      .eq("id", user.id)
      .single(),
    supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .eq("status", "active"),
  ]);

  const profile = profileResult.data as Pick<ProfileRow, "full_name" | "avatar_url" | "onboarded"> | null;
  const memberRows = memberResult.data as Pick<WorkspaceMemberRow, "workspace_id">[] | null;

  if (profile && !profile.onboarded) redirect("/onboarding");

  // Busca workspaces pelos IDs onde o usuário é membro ativo
  const workspaceIds = (memberRows ?? []).map((r) => r.workspace_id);
  let workspaces: SidebarWorkspace[] = [];

  if (workspaceIds.length > 0) {
    const { data: wsRows } = await supabase
      .from("workspaces")
      .select("id, name, slug, plan")
      .in("id", workspaceIds);

    const typed = wsRows as Pick<WorkspaceRow, "id" | "name" | "slug" | "plan">[] | null;

    workspaces = (typed ?? []).map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      plan: w.plan,
    }));
  }

  const sidebarUser: SidebarUser = {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={sidebarUser} workspaces={workspaces} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header user={sidebarUser} workspaces={workspaces} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
