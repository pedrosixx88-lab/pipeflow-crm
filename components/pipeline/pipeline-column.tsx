"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealCard } from "./deal-card";
import { STAGE_CONFIG } from "./pipeline-board";
import type { Deal, DealStage, Lead } from "@/types";

const STAGE_DOT: Record<string, string> = {
  novo_lead:         "bg-blue-500",
  contato_realizado: "bg-violet-500",
  proposta_enviada:  "bg-amber-500",
  negociacao:        "bg-orange-500",
  fechado_ganho:     "bg-emerald-500",
  fechado_perdido:   "bg-red-500",
};

function formatColumnValue(total: number): string {
  if (total >= 1_000_000)
    return `R$ ${(total / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (total >= 1_000)
    return `R$ ${(total / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`;
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PipelineColumnProps {
  stage: DealStage;
  deals: Deal[];
  leads: Lead[];
  onCreateDeal: (stage: DealStage) => void;
  onEditDeal: (deal: Deal) => void;
}

export function PipelineColumn({ stage, deals, leads, onCreateDeal, onEditDeal }: PipelineColumnProps) {
  const config = STAGE_CONFIG[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const dealIds = deals.map((d) => d.id);

  return (
    <div className="flex w-[272px] flex-shrink-0 flex-col gap-0">
      {/* Column header */}
      <div className="mb-2 rounded-xl border border-white/[0.07] bg-card px-3 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", STAGE_DOT[stage])} />
            <span className="truncate text-[12px] font-semibold text-card-foreground tracking-tight">
              {config.label}
            </span>
            <span className={cn(
              "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
              deals.length > 0
                ? "bg-white/10 text-card-foreground"
                : "bg-white/[0.05] text-muted-foreground"
            )}>
              {deals.length}
            </span>
          </div>
          <button
            onClick={() => onCreateDeal(stage)}
            aria-label={`Adicionar em ${config.label}`}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:bg-white/10 hover:text-card-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-1.5 flex items-baseline gap-1 pl-4">
          <span className="text-[11px] font-medium text-muted-foreground/60">Total</span>
          <span className="text-[13px] font-bold tabular-nums text-muted-foreground">
            {deals.length > 0 ? formatColumnValue(totalValue) : "—"}
          </span>
        </div>
      </div>

      {/* Droppable zone */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-1 flex-col gap-2 rounded-xl border p-2 transition-all duration-150",
            "min-h-[480px]",
            isOver
              ? "border-blue-500/40 bg-blue-500/[0.06] shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
              : "border-white/[0.05] bg-white/[0.02]"
          )}
        >
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              lead={leads.find((l) => l.id === deal.leadId)}
              onEdit={onEditDeal}
            />
          ))}

          {deals.length === 0 && (
            <button
              onClick={() => onCreateDeal(stage)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg py-10",
                "border-2 border-dashed border-white/[0.07]",
                "text-muted-foreground/50 transition-all duration-150",
                "hover:border-white/[0.15] hover:text-muted-foreground hover:bg-white/[0.03]"
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06]">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-medium">Adicionar negócio</span>
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
