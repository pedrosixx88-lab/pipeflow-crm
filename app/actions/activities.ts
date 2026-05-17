"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";

const activitySchema = z.object({
  leadId:      z.string().uuid(),
  type:        z.enum(["ligacao", "email", "reuniao", "nota"]),
  description: z.string().min(1, "Descrição é obrigatória"),
  occurredAt:  z.string().optional(),
});

export async function createActivity(formData: unknown) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = activitySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { data: ws } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!ws) return { error: "Workspace não encontrado" };

  const { data, error } = await supabase
    .from("activities")
    .insert({
      workspace_id: ws.id,
      lead_id:      parsed.data.leadId,
      author_id:    user.id,
      type:         parsed.data.type,
      description:  parsed.data.description,
      occurred_at:  parsed.data.occurredAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/leads/${parsed.data.leadId}`);
  return { data };
}
