import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

// Stripe precisa do raw body para verificar a assinatura — não usar body parser
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 2. Ler body como text (não JSON)
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook mal configurado." }, { status: 400 });
  }

  // 3. Verificar assinatura com stripe.webhooks.constructEvent()
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  // Webhook é chamado pelo Stripe sem sessão de usuário — usa service_role via createClient
  const supabase = await createClient();

  try {
    // 4. Tratar os 3 eventos
    switch (event.type) {
      // checkout.session.completed → ativa plano Pro
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        // 5. Ler workspace_id e user_id do metadata
        const workspaceId = session.metadata?.workspace_id;
        if (!workspaceId) break;

        const subscriptionId = session.subscription as string;
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        await upsertSubscription(supabase, workspaceId, sub);

        // Atualiza plano para Pro explicitamente
        await supabase
          .from("workspaces")
          .update({ plan: "pro" })
          .eq("id", workspaceId);

        break;
      }

      // customer.subscription.deleted → downgrade para Free
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        // 5. Ler workspace_id do metadata
        const workspaceId = sub.metadata?.workspace_id;
        if (!workspaceId) break;

        await upsertSubscription(supabase, workspaceId, sub);

        // Downgrade explícito para Free
        await supabase
          .from("workspaces")
          .update({ plan: "free", stripe_subscription_id: null })
          .eq("id", workspaceId);

        break;
      }

      // invoice.payment_failed → registra falha (mantém plano, assinatura fica past_due)
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.parent?.subscription_details?.subscription === "string"
            ? invoice.parent.subscription_details.subscription
            : (invoice.parent?.subscription_details?.subscription?.id ?? null);
        if (!subscriptionId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        // 5. Ler workspace_id do metadata da subscription
        const workspaceId = sub.metadata?.workspace_id;
        if (!workspaceId) break;

        // Sync do status (ficará past_due ou unpaid)
        await upsertSubscription(supabase, workspaceId, sub);

        // Marca o workspace com payment_failed para mostrar banner de alerta na UI
        await supabase
          .from("workspaces")
          .update({ plan: "payment_failed" })
          .eq("id", workspaceId);

        console.warn("[stripe-webhook] Falha no pagamento:", {
          workspaceId,
          subscriptionId,
          invoiceId: invoice.id,
        });

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook] Erro ao processar evento:", event.type, err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }

  // 6. Retornar NextResponse.json({ received: true })
  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  sub: Stripe.Subscription,
) {
  const priceId = sub.items.data[0]?.price.id ?? "";

  // Na API dahlia, current_period_* foram movidos para os items.
  // Usamos billing_cycle_anchor como referência de início e estimamos 30 dias de período.
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
