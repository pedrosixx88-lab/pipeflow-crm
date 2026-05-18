"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { getActiveWorkspaceId } from "@/lib/supabase/get-active-workspace";

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

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  if (!workspaceId) return { error: "Workspace não encontrado" };

  const { data, error } = await supabase
    .from("activities")
    .insert({
      workspace_id: workspaceId,
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
