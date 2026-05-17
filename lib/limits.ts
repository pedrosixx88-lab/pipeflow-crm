import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const FREE_LEAD_LIMIT = 50;
export const FREE_MEMBER_LIMIT = 2;

type TypedSupabase = SupabaseClient<Database>;

/** Retorna true se o workspace pode adicionar mais leads */
export async function canAddLead(
  supabase: TypedSupabase,
  workspaceId: string,
): Promise<boolean> {
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", workspaceId)
    .single();

  if (!workspace || workspace.plan === "pro") return true;

  const { count } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  return (count ?? 0) < FREE_LEAD_LIMIT;
}

/** Retorna true se o workspace pode adicionar mais membros */
export async function canAddMember(
  supabase: TypedSupabase,
  workspaceId: string,
): Promise<boolean> {
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", workspaceId)
    .single();

  if (!workspace || workspace.plan === "pro") return true;

  const { count } = await supabase
    .from("workspace_members")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "active");

  return (count ?? 0) < FREE_MEMBER_LIMIT;
}

/** Retorna contagens atuais para exibição na UI */
export async function getPlanUsage(
  supabase: TypedSupabase,
  workspaceId: string,
): Promise<{ leadCount: number; memberCount: number }> {
  const [leadsRes, membersRes] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "active"),
  ]);

  return {
    leadCount: leadsRes.count ?? 0,
    memberCount: membersRes.count ?? 0,
  };
}
