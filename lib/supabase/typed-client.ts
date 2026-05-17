/**
 * Wrappers tipados para o cliente Supabase.
 *
 * O @supabase/ssr@0.10 usa um tipo interno ligeiramente diferente do
 * SupabaseClient<Database> do @supabase/supabase-js, fazendo o TypeScript
 * inferir `never` em alguns contextos. Este helper força o cast correto
 * sem perder type safety nas operações.
 */
import { createClient as createBrowserClientBase } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type TypedSupabaseClient = ReturnType<
  typeof createBrowserClientBase<Database>
>;

export function asTyped(supabase: unknown): TypedSupabaseClient {
  return supabase as TypedSupabaseClient;
}
