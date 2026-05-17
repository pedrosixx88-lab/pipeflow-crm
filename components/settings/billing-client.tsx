"use client";

import { useTransition } from "react";
import {
  Zap,
  CheckCircle2,
  Crown,
  AlertCircle,
  Loader2,
  ExternalLink,
  Users,
  Contact,
} from "lucide-react";
import { createCheckoutSession, createPortalSession } from "@/app/actions/billing";
import { cn } from "@/lib/utils";
import { FREE_LEAD_LIMIT, FREE_MEMBER_LIMIT } from "@/lib/limits";
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
  leadCount: number;
  memberCount: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function UsageBar({
  icon: Icon,
  label,
  current,
  limit,
}: {
  icon: React.ElementType;
  label: string;
  current: number;
  limit: number;
}) {
  const pct = Math.min((current / limit) * 100, 100);
  const atLimit = current >= limit;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className={cn("font-medium tabular-nums", atLimit ? "text-red-500" : "text-foreground")}>
          {current} / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            atLimit ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-blue-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {atLimit && (
        <p className="text-xs text-red-500">Limite atingido — faça upgrade para continuar.</p>
      )}
    </div>
  );
}

const PLAN_COMPARISON = [
  { feature: "Leads", free: "Até 50", pro: "Ilimitados" },
  { feature: "Colaboradores", free: "Até 2", pro: "Ilimitados" },
  { feature: "Pipeline Kanban", free: "✓", pro: "✓" },
  { feature: "Dashboard de métricas", free: "✓", pro: "✓" },
  { feature: "Suporte prioritário", free: "—", pro: "✓" },
];

export function BillingClient({
  workspace,
  subscription,
  isAdmin,
  successMessage,
  canceledMessage,
  leadCount,
  memberCount,
}: BillingClientProps) {
  const [checkoutPending, startCheckout] = useTransition();
  const [portalPending, startPortal] = useTransition();

  const isPro = workspace.plan === "pro";
  const isPaymentFailed = workspace.plan === "payment_failed";
  const isCanceling = subscription?.cancel_at_period_end === true;
  const renewsAt = subscription?.current_period_end
    ? formatDate(subscription.current_period_end)
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Plano & Cobrança</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie o plano do workspace{" "}
          <span className="font-medium text-foreground">{workspace.name}</span>.
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
      {isPaymentFailed && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Falha no pagamento
            </p>
            <p className="text-xs text-red-500/80">
              Atualize seu método de pagamento para continuar usando o plano Pro.
            </p>
          </div>
        </div>
      )}

      {/* Card do plano atual */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                isPro ? "bg-blue-500/15" : isPaymentFailed ? "bg-red-500/15" : "bg-muted",
              )}
            >
              {isPro ? (
                <Crown className="size-5 text-blue-500" />
              ) : isPaymentFailed ? (
                <AlertCircle className="size-5 text-red-500" />
              ) : (
                <Zap className="size-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Plano atual</p>
              <p className="text-xl font-bold text-foreground">
                {isPro ? "Pro" : isPaymentFailed ? "Pro (pagamento pendente)" : "Free"}
              </p>
            </div>
          </div>
          {isPro && !isPaymentFailed && (
            <span className="inline-flex items-center rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-500">
              Ativo
            </span>
          )}
        </div>

        {isPro && renewsAt && (
          <p className="mt-4 text-sm text-muted-foreground">
            {isCanceling
              ? `Seu plano Pro fica ativo até ${renewsAt}. Após essa data, o workspace volta para Free.`
              : `Renova automaticamente em ${renewsAt}.`}
          </p>
        )}

        {/* Barras de uso — só no Free */}
        {!isPro && (
          <div className="mt-5 space-y-4 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Uso atual
            </p>
            <UsageBar
              icon={Contact}
              label="Leads"
              current={leadCount}
              limit={FREE_LEAD_LIMIT}
            />
            <UsageBar
              icon={Users}
              label="Colaboradores"
              current={memberCount}
              limit={FREE_MEMBER_LIMIT}
            />
          </div>
        )}
      </div>

      {/* Comparativo Free vs Pro */}
      {!isPro && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-3 border-b border-border bg-muted/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Funcionalidade</span>
            <span className="text-center">Free</span>
            <span className="text-center text-blue-500">Pro</span>
          </div>
          {PLAN_COMPARISON.map((row) => (
            <div
              key={row.feature}
              className="grid grid-cols-3 border-b border-border/50 px-4 py-3 text-sm last:border-0"
            >
              <span className="text-muted-foreground">{row.feature}</span>
              <span className="text-center text-muted-foreground">{row.free}</span>
              <span className="text-center font-medium text-foreground">{row.pro}</span>
            </div>
          ))}
        </div>
      )}

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

          <div className="mt-4 flex flex-wrap gap-3">
            {isPro || isPaymentFailed ? (
              <button
                disabled={portalPending}
                onClick={() => startPortal(async () => { await createPortalSession(); })}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {portalPending ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
                {portalPending ? "Abrindo portal..." : "Gerenciar Assinatura"}
              </button>
            ) : (
              <button
                disabled={checkoutPending}
                onClick={() => startCheckout(async () => { await createCheckoutSession(); })}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {checkoutPending ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
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
