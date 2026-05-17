"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

const WORKSPACE_COOKIE = "pf_workspace_id";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase: asTyped(supabase), user };
}

async function getActiveWorkspaceId(
  supabase: ReturnType<typeof asTyped>,
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
): Promise<{ error: string } | null> {
  const { data } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .eq("role", "admin")
    .eq("status", "active")
    .single();

  if (!data) return { error: "Apenas administradores podem gerenciar o plano." };
  return null;
}

/** Cria uma Checkout Session do Stripe e redireciona o usuário */
export async function createCheckoutSession(): Promise<{ error: string } | never> {
  const { supabase, user } = await getAuthenticatedUser();

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  if (!workspaceId) return { error: "Workspace não encontrado." };

  const adminErr = await assertAdmin(supabase, workspaceId, user.id);
  if (adminErr) return adminErr;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, plan, stripe_customer_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace) return { error: "Workspace não encontrado." };
  if (workspace.plan === "pro") return { error: "Este workspace já é Pro." };

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) return { error: "Configuração de plano indisponível." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const customerId = await getOrCreateStripeCustomer(
    workspaceId,
    workspace.stripe_customer_id,
    user.email!,
    workspace.name,
  );

  // Persiste o customer_id caso tenha sido criado agora
  if (!workspace.stripe_customer_id) {
    await supabase
      .from("workspaces")
      .update({ stripe_customer_id: customerId })
      .eq("id", workspaceId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings/billing?success=1`,
    cancel_url: `${appUrl}/settings/billing?canceled=1`,
    metadata: { workspace_id: workspaceId },
    subscription_data: {
      metadata: { workspace_id: workspaceId },
    },
  });

  redirect(session.url!);
}

/** Abre o Customer Portal do Stripe para gerenciar assinatura */
export async function createPortalSession(): Promise<{ error: string } | never> {
  const { supabase, user } = await getAuthenticatedUser();

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  if (!workspaceId) return { error: "Workspace não encontrado." };

  const adminErr = await assertAdmin(supabase, workspaceId, user.id);
  if (adminErr) return adminErr;

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("stripe_customer_id")
    .eq("id", workspaceId)
    .single();

  if (!workspace?.stripe_customer_id) {
    return { error: "Nenhuma assinatura encontrada para este workspace." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: `${appUrl}/settings/billing`,
  });

  redirect(portalSession.url);
}
