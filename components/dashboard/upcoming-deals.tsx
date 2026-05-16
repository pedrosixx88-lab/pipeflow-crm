import { CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deal, Lead } from "@/types";

interface UpcomingDeal {
  deal: Deal;
  lead: Lead;
  daysLeft: number;
}

interface UpcomingDealsProps {
  items: UpcomingDeal[];
}

function UrgencyBadge({ daysLeft }: { daysLeft: number }) {
  if (daysLeft < 0) {
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500">
        Vencido
      </span>
    );
  }
  if (daysLeft === 0) {
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500">
        Hoje
      </span>
    );
  }
  if (daysLeft <= 3) {
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-500">
        {daysLeft}d
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-500">
        {daysLeft}d
      </span>
    );
  }
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {daysLeft}d
    </span>
  );
}

const STAGE_LABELS: Record<string, string> = {
  novo_lead: "Novo Lead",
  contato_realizado: "Contato Realizado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado Ganho",
  fechado_perdido: "Fechado Perdido",
};

export function UpcomingDeals({ items }: UpcomingDealsProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CalendarClock className="mb-2 size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Nenhum negócio com prazo próximo.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {items.map(({ deal, lead, daysLeft }) => (
        <div key={deal.id} className="flex items-center gap-3 py-3">
          {/* urgency bar */}
          <div
            className={cn(
              "h-9 w-1 shrink-0 rounded-full",
              daysLeft < 0
                ? "bg-red-500"
                : daysLeft <= 3
                  ? "bg-red-500"
                  : daysLeft <= 7
                    ? "bg-amber-500"
                    : "bg-muted-foreground/30"
            )}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {deal.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {lead.name} · {lead.company} · {STAGE_LABELS[deal.stage]}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-sm font-semibold text-foreground">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              }).format(deal.value)}
            </span>
            <UrgencyBadge daysLeft={daysLeft} />
          </div>
        </div>
      ))}
    </div>
  );
}
