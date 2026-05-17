"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { queryLeadCount } from "@/lib/supabase/queries/leads";

const FREE_LEAD_LIMIT = 50;

const leadSchema = z.object({
  name: z.string().min(2, "Nome precisa ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  status: z.enum([
    "novo",
    "contato_realizado",
    "proposta_enviada",
    "negociacao",
    "fechado_ganho",
    "fechado_perdido",
  ]),
  notes: z.string().optional(),
});

async function getActiveWorkspace(supabase: ReturnType<typeof asTyped>) {
  const { data } = await supabase
    .from("workspaces")
    .select("id, plan")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data;
}

export async function createLead(formData: unknown) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = leadSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const ws = await getActiveWorkspace(supabase);
  if (!ws) return { error: "Workspace não encontrado" };

  // Guard: plano Free tem limite de 50 leads
  if (ws.plan === "free") {
    const count = await queryLeadCount(supabase, ws.id);
    if (count >= FREE_LEAD_LIMIT) {
      return { error: `Limite de ${FREE_LEAD_LIMIT} leads atingido. Faça upgrade para o plano Pro.` };
    }
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: ws.id,
      owner_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      company: parsed.data.company ?? null,
      role: parsed.data.role ?? null,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/leads");
  return { data };
}

export async function updateLead(id: string, formData: unknown) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = leadSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      company: parsed.data.company ?? null,
      role: parsed.data.role ?? null,
      status: parsed.data.status,
      notes: parsed.data.notes ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { data };
}

export async function archiveLead(id: string) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("leads")
    .update({ status: "arquivado" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/leads");
  return { success: true };
}

export async function deleteLead(id: string) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/leads");
  return { success: true };
}
