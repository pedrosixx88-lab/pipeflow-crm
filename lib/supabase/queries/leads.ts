import type { TypedSupabaseClient } from "@/lib/supabase/typed-client";
import type { LeadStatus } from "@/types";

export interface LeadFilters {
  search?: string;
  status?: LeadStatus | "all";
  page?: number;
  pageSize?: number;
}

export async function queryLeads(
  supabase: TypedSupabaseClient,
  workspaceId: string,
  filters: LeadFilters = {}
) {
  const { search = "", status = "all", page = 1, pageSize = 50 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .eq("workspace_id", workspaceId)
    .neq("status", "arquivado")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search.trim()) {
    query = query.or(
      `name.ilike.%${search.trim()}%,company.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`
    );
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  return query;
}

export async function queryLeadById(
  supabase: TypedSupabaseClient,
  id: string
) {
  return supabase.from("leads").select("*").eq("id", id).single();
}

export async function queryLeadCount(
  supabase: TypedSupabaseClient,
  workspaceId: string
) {
  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .neq("status", "arquivado");
  return count ?? 0;
}
