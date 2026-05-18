"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { getActiveWorkspaceId } from "@/lib/supabase/get-active-workspace";

const dealSchema = z.object({
  title: z.string().min(2, "Título precisa ter ao menos 2 caracteres"),
  value: z.number().min(0),
  leadId: z.string().min(1, "Selecione um lead"),
  stage: z.enum([
    "novo_lead",
    "contato_realizado",
    "proposta_enviada",
    "negociacao",
    "fechado_ganho",
    "fechado_perdido",
  ]),
  deadline: z.string().optional(),
});

export async function createDeal(formData: unknown) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = dealSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  if (!workspaceId) return { error: "Workspace não encontrado" };

  // Posição = último da coluna
  const { count } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("stage", parsed.data.stage);

  const { data, error } = await supabase
    .from("deals")
    .insert({
      workspace_id: workspaceId,
      lead_id: parsed.data.leadId,
      owner_id: user.id,
      title: parsed.data.title,
      value: parsed.data.value,
      stage: parsed.data.stage,
      position: count ?? 0,
      deadline: parsed.data.deadline || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { data };
}

export async function updateDeal(id: string, formData: unknown) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = dealSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("deals")
    .update({
      lead_id: parsed.data.leadId,
      title: parsed.data.title,
      value: parsed.data.value,
      stage: parsed.data.stage,
      deadline: parsed.data.deadline || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { data };
}

export async function moveDeal(
  id: string,
  newStage: string,
  newPosition: number,
  affectedDeals: { id: string; position: number }[]
) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("deals")
    .update({ stage: newStage as "novo_lead", position: newPosition })
    .eq("id", id);

  if (error) return { error: error.message };

  if (affectedDeals.length > 0) {
    await Promise.all(
      affectedDeals.map(({ id: affectedId, position }) =>
        supabase
          .from("deals")
          .update({ position })
          .eq("id", affectedId)
      )
    );
  }

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteDeal(id: string) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("deals").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { success: true };
}
