import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

// Desabilita o body parser do Next.js — Stripe precisa do raw body para verificar assinatura
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook mal configurado." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  // Supabase com service_role — webhook é externo (sem sessão de usuário)
  const supabase = await createClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const workspaceId = session.metadata?.workspace_id;
        if (!workspaceId) break;

        const subscriptionId = session.subscription as string;
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        await upsertSubscription(supabase, workspaceId, sub);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspace_id;
        if (!workspaceId) break;

        await upsertSubscription(supabase, workspaceId, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const workspaceId = sub.metadata?.workspace_id;
        if (!workspaceId) break;

        // Marca como cancelada — o trigger sync_workspace_plan volta para free
        await upsertSubscription(supabase, workspaceId, sub);
        break;
      }

      default:
        // Ignora eventos não tratados
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] Erro ao processar evento:", event.type, err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  sub: Stripe.Subscription,
) {
  const item = sub.items.data[0];
  const priceId = item?.price.id ?? "";

  // Na API dahlia, current_period_* foram movidos para os items.
  // Usamos billing_cycle_anchor como referência de início e calculamos
  // o período de 30 dias a partir dele como estimativa de fim.
  const periodStartTs = sub.billing_cycle_anchor ?? sub.start_date;
  const periodStart = new Date(periodStartTs * 1000).toISOString();
  const periodEnd = new Date((periodStartTs + 30 * 24 * 60 * 60) * 1000).toISOString();

  const { error } = await supabase.from("subscriptions").upsert(
    {
      workspace_id: workspaceId,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer as string,
      stripe_price_id: priceId,
      status: sub.status as "active" | "trialing" | "past_due" | "canceled" | "unpaid" | "incomplete",
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at
        ? new Date(sub.canceled_at * 1000).toISOString()
        : null,
    },
    { onConflict: "stripe_subscription_id" },
  );

  if (error) {
    throw new Error(`upsertSubscription falhou: ${error.message}`);
  }
}
