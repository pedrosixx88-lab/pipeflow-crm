"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { resend, FROM_EMAIL } from "@/lib/resend";
import { InviteEmail, inviteEmailText } from "@/emails/invite";

const FREE_MEMBER_LIMIT = 2;

// Cookie que armazena o workspace ativo do usuário
const WORKSPACE_COOKIE = "pf_workspace_id";

// ── Helpers ──────────────────────────────────────────────────────

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase: asTyped(supabase), user };
}

async function getActiveWorkspaceId(supabase: ReturnType<typeof asTyped>, userId: string) {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(WORKSPACE_COOKIE)?.value;

  if (fromCookie) {
    // Verifica se o usuário ainda é membro deste workspace
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

async function assertAdmin(
  supabase: ReturnType<typeof asTyped>,
  workspaceId: string,
  userId: string,
) {
  const { data } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("role", "admin")
    .eq("status", "active")
    .single();

  if (!data) throw new Error("Apenas administradores podem realizar esta ação.");
}

// ── Schemas ──────────────────────────────────────────────────────

const updateWorkspaceSchema = z.object({
  name: z.string().min(2, "Nome precisa ter ao menos 2 caracteres").max(50),
});

const inviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "member"]),
  workspaceId: z.string().uuid(),
});

const memberIdSchema = z.object({
  memberId: z.string().uuid(),
});

const updateRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["admin", "member"]),
});

// ── Actions ──────────────────────────────────────────────────────

/** Atualiza o nome do workspace ativo */
export async function updateWorkspace(formData: unknown) {
  const { supabase, user } = await getAuthenticatedUser();
  const parsed = updateWorkspaceSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  if (!workspaceId) return { error: "Workspace não encontrado." };

  await assertAdmin(supabase, workspaceId, user.id);

  const { error } = await supabase
    .from("workspaces")
    .update({ name: parsed.data.name })
    .eq("id", workspaceId);

  if (error) return { error: "Falha ao atualizar o workspace." };

  revalidatePath("/settings/workspace");
  return { success: true };
}

/** Convida um membro por e-mail — respeita limite do plano Free */
export async function inviteMember(formData: unknown) {
  const { supabase, user } = await getAuthenticatedUser();
  const parsed = inviteSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, role, workspaceId } = parsed.data;

  await assertAdmin(supabase, workspaceId, user.id);

  // Busca workspace para checar plano e nome
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name, plan")
    .eq("id", workspaceId)
    .single();

  if (!workspace) return { error: "Workspace não encontrado." };

  // Limite de membros no plano Free
  if (workspace.plan === "free") {
    const { count } = await supabase
      .from("workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "active");

    if ((count ?? 0) >= FREE_MEMBER_LIMIT) {
      return {
        error: `O plano Free permite no máximo ${FREE_MEMBER_LIMIT} membros ativos. Faça upgrade para Pro para convidar mais colaboradores.`,
        limitReached: true,
      };
    }
  }

  // Verifica se já existe convite pendente para este e-mail
  const { data: existing } = await supabase
    .from("workspace_invites")
    .select("id, accepted_at")
    .eq("workspace_id", workspaceId)
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (existing) {
    return { error: "Já existe um convite pendente para este e-mail." };
  }

  // Verifica se o e-mail já é membro ativo
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  // Busca o profile do convidado pelo e-mail via auth (precisa de admin)
  // Usamos uma abordagem simples: verificar workspace_members com invited_email
  const { data: alreadyMember } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("invited_email", email)
    .eq("status", "active")
    .single();

  if (alreadyMember) {
    return { error: "Este e-mail já é membro ativo do workspace." };
  }

  // Busca nome do convidador
  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const inviterName = inviterProfile?.full_name || user.email || "Alguém";

  // Cria o convite
  const { data: invite, error: inviteError } = await supabase
    .from("workspace_invites")
    .insert({
      workspace_id: workspaceId,
      invited_by: user.id,
      email,
      role,
    })
    .select("token")
    .single();

  if (inviteError || !invite) {
    return { error: "Falha ao criar o convite. Tente novamente." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${invite.token}`;

  // Envia e-mail
  const html = renderToStaticMarkup(
    React.createElement(InviteEmail, {
      invitedByName: inviterName,
      workspaceName: workspace.name,
      role,
      inviteUrl,
    }),
  );

  const { error: emailError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `${inviterName} convidou você para ${workspace.name} no PipeFlow CRM`,
    html,
    text: inviteEmailText({
      invitedByName: inviterName,
      workspaceName: workspace.name,
      role,
      inviteUrl,
    }),
  });

  if (emailError) {
    // Convite foi criado mas e-mail falhou — retorna o link para envio manual
    console.error("[invite] Resend error:", emailError);
    revalidatePath("/settings/workspace");
    return {
      success: true,
      warning: "Convite criado, mas o e-mail não pôde ser enviado. Compartilhe o link manualmente.",
      inviteUrl,
    };
  }

  revalidatePath("/settings/workspace");
  return { success: true };
}

/** Aceita convite via token — chamado na página /invite/[token] */
export async function acceptInvite(token: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: result, error } = await supabase.rpc("accept_workspace_invite", {
    p_token: token,
    p_user_id: user.id,
  });

  if (error) {
    return { error: "Falha ao processar o convite. Tente novamente." };
  }

  const res = result as { error?: string; workspace_id?: string; already_member?: boolean };

  if (res.error === "invite_invalid_or_expired") {
    return { error: "Este convite é inválido ou já expirou." };
  }
  if (res.error === "member_limit_reached") {
    return {
      error: "O workspace atingiu o limite de membros do plano Free. O administrador precisa fazer upgrade para Pro.",
    };
  }
  if (res.error) {
    return { error: "Ocorreu um erro inesperado." };
  }

  const workspaceId = res.workspace_id;
  if (!workspaceId) return { error: "Resposta inesperada do servidor." };

  // Define o workspace recém aceito como ativo
  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });

  return { success: true, workspaceId, alreadyMember: res.already_member };
}

/** Remove um membro do workspace */
export async function removeMember(formData: unknown) {
  const { supabase, user } = await getAuthenticatedUser();
  const parsed = memberIdSchema.safeParse(formData);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { memberId } = parsed.data;

  // Busca o membro para obter o workspace_id
  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, user_id, role")
    .eq("id", memberId)
    .single();

  if (!member) return { error: "Membro não encontrado." };

  await assertAdmin(supabase, member.workspace_id, user.id);

  // Impede remoção do próprio admin
  if (member.user_id === user.id) {
    return { error: "Você não pode se remover do workspace." };
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId);

  if (error) return { error: "Falha ao remover o membro." };

  revalidatePath("/settings/workspace");
  return { success: true };
}

/** Atualiza o papel de um membro */
export async function updateMemberRole(formData: unknown) {
  const { supabase, user } = await getAuthenticatedUser();
  const parsed = updateRoleSchema.safeParse(formData);
  if (!parsed.success) return { error: "Dados inválidos." };

  const { memberId, role } = parsed.data;

  const { data: member } = await supabase
    .from("workspace_members")
    .select("workspace_id, user_id")
    .eq("id", memberId)
    .single();

  if (!member) return { error: "Membro não encontrado." };

  await assertAdmin(supabase, member.workspace_id, user.id);

  // Impede rebaixamento do próprio admin
  if (member.user_id === user.id) {
    return { error: "Você não pode alterar seu próprio papel." };
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId);

  if (error) return { error: "Falha ao atualizar o papel do membro." };

  revalidatePath("/settings/workspace");
  return { success: true };
}

/** Revoga um convite pendente */
export async function revokeInvite(inviteId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  const { data: invite } = await supabase
    .from("workspace_invites")
    .select("workspace_id")
    .eq("id", inviteId)
    .single();

  if (!invite) return { error: "Convite não encontrado." };

  await assertAdmin(supabase, invite.workspace_id, user.id);

  const { error } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", inviteId);

  if (error) return { error: "Falha ao revogar o convite." };

  revalidatePath("/settings/workspace");
  return { success: true };
}

/** Alterna o workspace ativo via cookie */
export async function switchWorkspace(workspaceId: string) {
  const { supabase, user } = await getAuthenticatedUser();

  // Verifica que o usuário é membro ativo
  const { data } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (!data) return { error: "Workspace não encontrado ou acesso negado." };

  const cookieStore = await cookies();
  cookieStore.set(WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: false,
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
