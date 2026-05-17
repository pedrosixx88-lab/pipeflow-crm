import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/shared/sidebar";
import { Header } from "@/components/shared/header";
import type { SidebarUser, SidebarWorkspace } from "@/components/shared/sidebar";
import type { ProfileRow, WorkspaceRow } from "@/types/database";

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

  // Busca perfil e workspaces em paralelo — RLS garante isolamento por usuário.
  // workspaces usa my_workspace_ids() via RLS, evitando N+1 query.
  const [profileResult, workspacesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, onboarded")
      .eq("id", user.id)
      .single(),
    supabase
      .from("workspaces")
      .select("id, name, slug, plan")
      .order("created_at", { ascending: true }),
  ]);

  const profile = profileResult.data as Pick<ProfileRow, "full_name" | "avatar_url" | "onboarded"> | null;

  // Redireciona para onboarding se perfil não existe ainda ou não foi onboarded
  if (!profile || !profile.onboarded) redirect("/onboarding");

  const wsRows = workspacesResult.data as Pick<WorkspaceRow, "id" | "name" | "slug" | "plan">[] | null;

  const workspaces: SidebarWorkspace[] = (wsRows ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    slug: w.slug,
    plan: w.plan,
  }));

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
