import type { TypedSupabaseClient } from "@/lib/supabase/typed-client";

export async function queryDealsByWorkspace(
  supabase: TypedSupabaseClient,
  workspaceId: string
) {
  return supabase
    .from("deals")
    .select("*, leads(id, name, company)")
    .eq("workspace_id", workspaceId)
    .order("stage")
    .order("position");
}

export async function queryDealById(
  supabase: TypedSupabaseClient,
  id: string
) {
  return supabase
    .from("deals")
    .select("*, leads(id, name, company)")
    .eq("id", id)
    .single();
}

export async function queryDealsByLead(
  supabase: TypedSupabaseClient,
  leadId: string
) {
  return supabase
    .from("deals")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });
}
