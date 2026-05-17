"use client";

import { useTransition, useEffect } from "react";
import { Zap, CheckCircle2, Crown, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { createCheckoutSession, createPortalSession } from "@/app/actions/billing";
import { cn } from "@/lib/utils";
import type { WorkspaceRow, SubscriptionRow } from "@/types/database";

type SubscriptionData = Pick<
  SubscriptionRow,
  "status" | "current_period_end" | "cancel_at_period_end" | "canceled_at"
> | null;

type WorkspaceData = Pick<
  WorkspaceRow,
  "id" | "name" | "plan" | "stripe_customer_id" | "stripe_subscription_id"
>;

interface BillingClientProps {
  workspace: WorkspaceData;
  subscription: SubscriptionData;
  isAdmin: boolean;
  successMessage: boolean;
  canceledMessage: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

const FREE_FEATURES = [
  "Até 50 leads",
  "Até 2 colaboradores",
  "Pipeline Kanban",
  "Dashboard de métricas",
];

const PRO_FEATURES = [
  "Leads ilimitados",
  "Colaboradores ilimitados",
  "Pipeline Kanban",
  "Dashboard de métricas",
  "Suporte prioritário",
];

export function BillingClient({
  workspace,
  subscription,
  isAdmin,
  successMessage,
  canceledMessage,
}: BillingClientProps) {
  const [checkoutPending, startCheckout] = useTransition();
  const [portalPending, startPortal] = useTransition();

  const isPro = workspace.plan === "pro";
  const isCanceling = subscription?.cancel_at_period_end === true;
  const renewsAt = subscription?.current_period_end
    ? formatDate(subscription.current_period_end)
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plano & Cobrança</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o plano do workspace <span className="font-medium text-foreground">{workspace.name}</span>.
        </p>
      </div>

      {/* Banners de feedback */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
          <CheckCircle2 className="size-4 shrink-0 text-green-500" />
          <p className="text-sm text-green-600 dark:text-green-400">
            Pagamento confirmado! Seu workspace agora é Pro.
          </p>
        </div>
      )}
      {canceledMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertCircle className="size-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Pagamento cancelado. Nenhuma cobrança foi realizada.
          </p>
        </div>
      )}

      {/* Card do plano atual */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                isPro ? "bg-blue-500/15" : "bg-muted",
              )}
            >
              {isPro ? (
                <Crown className="size-5 text-blue-500" />
              ) : (
                <Zap className="size-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plano atual</p>
              <p className="text-xl font-bold text-foreground">
                {isPro ? "Pro" : "Free"}
              </p>
            </div>
          </div>

          {isPro && (
            <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-500">
              Ativo
            </span>
          )}
        </div>

        {/* Info de renovação / cancelamento */}
        {isPro && renewsAt && (
          <p className="mt-4 text-sm text-muted-foreground">
            {isCanceling
              ? `Seu plano Pro fica ativo até ${renewsAt}. Após essa data, o workspace volta para Free.`
              : `Renova automaticamente em ${renewsAt}.`}
          </p>
        )}

        {/* Features */}
        <ul className="mt-4 space-y-2">
          {(isPro ? PRO_FEATURES : FREE_FEATURES).map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Ações */}
      {isAdmin && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground">
            {isPro ? "Gerenciar assinatura" : "Fazer upgrade para Pro"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isPro
              ? "Altere o método de pagamento, veja faturas ou cancele sua assinatura."
              : "Desbloqueie leads e colaboradores ilimitados por R$49/mês."}
          </p>

          <div className="mt-4">
            {isPro ? (
              <button
                disabled={portalPending}
                onClick={() =>
                  startPortal(async () => {
                    await createPortalSession();
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {portalPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ExternalLink className="size-4" />
                )}
                {portalPending ? "Abrindo portal..." : "Gerenciar no Stripe"}
              </button>
            ) : (
              <button
                disabled={checkoutPending}
                onClick={() =>
                  startCheckout(async () => {
                    await createCheckoutSession();
                  })
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {checkoutPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4" />
                )}
                {checkoutPending ? "Redirecionando..." : "Assinar Pro — R$49/mês"}
              </button>
            )}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Apenas administradores podem gerenciar o plano deste workspace.
          </p>
        </div>
      )}
    </div>
  );
}
