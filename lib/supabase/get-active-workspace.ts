import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const WORKSPACE_COOKIE = "pf_workspace_id";

/**
 * Retorna o workspace_id ativo do usuário lendo o cookie pf_workspace_id.
 * Valida se o usuário ainda é membro ativo. Faz fallback para o primeiro workspace.
 */
export async function getActiveWorkspaceId(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(WORKSPACE_COOKIE)?.value;

  if (fromCookie) {
    const { data } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", fromCookie)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();
    if (data) return fromCookie;
  }

  // Fallback: primeiro workspace do usuário
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  return data?.workspace_id ?? null;
}
