"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function createWorkspaceAction(formData: FormData) {
  const parsed = createWorkspaceSchema.safeParse({
    name: formData.get("workspaceName"),
  });

  if (!parsed.success) {
    return { error: "Nome inválido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sessão expirada. Faça login novamente." };
  }

  // Use admin client to bypass RLS for workspace creation.
  const admin = createAdminClient();
  const baseSlug = slugify(parsed.data.name);

  // Admin client types collapse to `never` for chained insert queries — same
  // issue as the browser client. Cast at the table boundary; runtime is correct.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wsTable = admin.from("workspaces") as any;

  const insertWorkspace = async (slug: string) =>
    wsTable
      .insert({ name: parsed.data.name, slug })
      .select("id")
      .single() as Promise<{ data: { id: string } | null; error: { code: string } | null }>;

  let workspaceId: string | null = null;

  const first = await insertWorkspace(baseSlug);
  if (first.error) {
    if (first.error.code === "23505") {
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
      const retry = await insertWorkspace(slug);
      if (retry.error || !retry.data) {
        return { error: "Erro ao criar workspace. Tente novamente." };
      }
      workspaceId = retry.data.id;
    } else {
      return { error: "Erro ao criar workspace. Tente novamente." };
    }
  } else if (!first.data) {
    return { error: "Erro ao criar workspace. Tente novamente." };
  } else {
    workspaceId = first.data.id;
  }

  // Explicitly add the user as admin member — trigger won't fire because
  // admin client runs as service_role where auth.uid() = null.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from("workspace_members") as any).insert({
    workspace_id: workspaceId,
    user_id: user.id,
    role: "admin",
    status: "active",
  });

  // Mark profile as onboarded using the user's own client (respects RLS correctly)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from("profiles") as any).update({ onboarded: true }).eq("id", user.id);

  redirect("/dashboard");
}
