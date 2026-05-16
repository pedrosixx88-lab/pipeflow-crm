// Placeholder — substituir pelo output de: supabase gen types typescript --local
// Após criar as migrations no Supabase, rodar:
// npx supabase gen types typescript --local > types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
