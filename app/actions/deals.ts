"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { getActiveWorkspaceId } from "@/lib/supabase/get-active-workspace";

const DEAL_STAGES = ["novo_lead","contato_realizado","proposta_enviada","negociacao","fechado_ganho","fechado_perdido"] as const;

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

  if (error) {
    console.error("[createDeal]", error);
    return { error: "Falha ao criar o negócio. Tente novamente." };
  }

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

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  const { data: existing } = await supabase.from("deals").select("workspace_id").eq("id", id).single();
  if (!existing || existing.workspace_id !== workspaceId) return { error: "Não autorizado." };

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

  if (error) {
    console.error("[updateDeal]", error);
    return { error: "Falha ao atualizar o negócio. Tente novamente." };
  }

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { data };
}

const moveDealSchema = z.object({
  id: z.string().uuid(),
  newStage: z.enum(DEAL_STAGES),
  newPosition: z.number().int().min(0),
  affectedDeals: z.array(z.object({ id: z.string().uuid(), position: z.number().int().min(0) })),
});

export async function moveDeal(
  id: string,
  newStage: string,
  newPosition: number,
  affectedDeals: { id: string; position: number }[]
) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = moveDealSchema.safeParse({ id, newStage, newPosition, affectedDeals });
  if (!parsed.success) return { error: "Dados inválidos." };

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  const { data: existing } = await supabase.from("deals").select("workspace_id").eq("id", parsed.data.id).single();
  if (!existing || existing.workspace_id !== workspaceId) return { error: "Não autorizado." };

  const { error } = await supabase
    .from("deals")
    .update({ stage: parsed.data.newStage, position: parsed.data.newPosition })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("[moveDeal]", error);
    return { error: "Falha ao mover o negócio. Tente novamente." };
  }

  if (parsed.data.affectedDeals.length > 0) {
    // Verifica que todos os affected deals pertencem ao mesmo workspace
    const affectedIds = parsed.data.affectedDeals.map((d) => d.id);
    const { data: affectedRows } = await supabase
      .from("deals")
      .select("id, workspace_id")
      .in("id", affectedIds);
    const allOwned = affectedRows?.every((r) => r.workspace_id === workspaceId) ?? false;
    if (!allOwned) return { error: "Não autorizado." };

    await Promise.all(
      parsed.data.affectedDeals.map(({ id: affectedId, position }) =>
        supabase.from("deals").update({ position }).eq("id", affectedId)
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

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  const { data: existing } = await supabase.from("deals").select("workspace_id").eq("id", id).single();
  if (!existing || existing.workspace_id !== workspaceId) return { error: "Não autorizado." };

  const { error } = await supabase.from("deals").delete().eq("id", id);

  if (error) {
    console.error("[deleteDeal]", error);
    return { error: "Falha ao excluir o negócio. Tente novamente." };
  }

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  return { success: true };
}
