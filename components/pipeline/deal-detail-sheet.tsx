"use client";

import { Building2, CalendarDays, Clock, Pencil, TriangleAlert } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STAGE_CONFIG } from "./pipeline-board";
import { formatDate } from "@/lib/utils";
import type { Deal, Lead } from "@/types";

const STAGE_PILL: Record<string, string> = {
  novo_lead:         "bg-blue-500/15 text-blue-400 border-blue-500/20",
  contato_realizado: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  proposta_enviada:  "bg-amber-500/15 text-amber-400 border-amber-500/20",
  negociacao:        "bg-orange-500/15 text-orange-400 border-orange-500/20",
  fechado_ganho:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  fechado_perdido:   "bg-red-500/15 text-red-400 border-red-500/20",
};

const STAGE_VALUE_COLOR: Record<string, string> = {
  novo_lead:         "text-blue-400",
  contato_realizado: "text-violet-400",
  proposta_enviada:  "text-amber-400",
  negociacao:        "text-orange-400",
  fechado_ganho:     "text-emerald-400",
  fechado_perdido:   "text-red-400",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getDeadlineDiff(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
}

interface DealDetailSheetProps {
  deal: Deal | null;
  lead: Lead | undefined;
  onClose: () => void;
  onEdit: (deal: Deal) => void;
}

export function DealDetailSheet({ deal, lead, onClose, onEdit }: DealDetailSheetProps) {
  if (!deal) return null;

  const config = STAGE_CONFIG[deal.stage];
  const deadlineDiff = deal.deadline ? getDeadlineDiff(deal.deadline) : null;
  const isWarning = deadlineDiff !== null && deadlineDiff <= 7;
  const isOverdue = deadlineDiff !== null && deadlineDiff <= 0;

  return (
    <Sheet open={Boolean(deal)} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b border-border px-6 py-5">
          <span className={cn(
            "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
            STAGE_PILL[deal.stage]
          )}>
            {config.label}
          </span>
          <SheetTitle className="mt-2 text-lg font-bold leading-snug text-foreground">
            {deal.title}
          </SheetTitle>
          <SheetDescription className="sr-only">Detalhes do negócio {deal.title}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {/* Value */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Valor</p>
              <p className={cn("mt-1 text-3xl font-bold tabular-nums", STAGE_VALUE_COLOR[deal.stage])}>
                {formatCurrency(deal.value)}
              </p>
            </div>

            {/* Lead */}
            {lead && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Lead</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-400">
                    {lead.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                    {lead.company && <p className="text-xs text-muted-foreground">{lead.company}</p>}
                    {lead.role && <p className="text-xs text-muted-foreground/60">{lead.role}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Deadline */}
            {deal.deadline && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Prazo</p>
                <div className={cn(
                  "mt-1.5 flex items-center gap-2 text-sm font-medium",
                  isOverdue ? "text-red-400" : isWarning ? "text-amber-400" : "text-foreground"
                )}>
                  {isWarning
                    ? <TriangleAlert className="h-4 w-4" />
                    : <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  }
                  {formatDate(deal.deadline)}
                  {isOverdue && (
                    <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-400">Vencido</span>
                  )}
                  {!isOverdue && isWarning && deadlineDiff !== null && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
                      {deadlineDiff === 1 ? "amanhã" : `${deadlineDiff} dias`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Criado em {formatDate(deal.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>Atualizado em {formatDate(deal.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t border-border px-6 py-4">
          <Button onClick={() => onEdit(deal)} className="gap-2" size="sm">
            <Pencil className="h-3.5 w-3.5" />
            Editar Negócio
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
