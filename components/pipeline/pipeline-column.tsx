"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealCard } from "./deal-card";
import { STAGE_CONFIG } from "./pipeline-board";
import type { Deal, DealStage, Lead } from "@/types";

const STAGE_COLUMN_STYLE: Record<string, { headerDot: string; emptyIcon: string; columnBg: string }> = {
  novo_lead:         { headerDot: "bg-blue-500",    emptyIcon: "text-blue-300",    columnBg: "bg-blue-50/30" },
  contato_realizado: { headerDot: "bg-violet-500",  emptyIcon: "text-violet-300",  columnBg: "bg-violet-50/30" },
  proposta_enviada:  { headerDot: "bg-amber-500",   emptyIcon: "text-amber-300",   columnBg: "bg-amber-50/20" },
  negociacao:        { headerDot: "bg-orange-500",  emptyIcon: "text-orange-300",  columnBg: "bg-orange-50/20" },
  fechado_ganho:     { headerDot: "bg-emerald-500", emptyIcon: "text-emerald-300", columnBg: "bg-emerald-50/30" },
  fechado_perdido:   { headerDot: "bg-red-400",     emptyIcon: "text-red-300",     columnBg: "bg-red-50/20" },
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
  const style = STAGE_COLUMN_STYLE[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const dealIds = deals.map((d) => d.id);

  return (
    <div className="flex w-[272px] flex-shrink-0 flex-col gap-0">
      {/* Column header card */}
      <div
        className={cn(
          "mb-2 rounded-xl border border-gray-200/80 bg-white px-3 py-2.5",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {/* Stage color dot */}
            <span className={cn("h-2 w-2 flex-shrink-0 rounded-full", style.headerDot)} />

            {/* Stage name */}
            <span className="truncate text-[12px] font-semibold text-gray-800 tracking-tight">
              {config.label}
            </span>

            {/* Deal count badge */}
            <span className={cn(
              "flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
              deals.length > 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
            )}>
              {deals.length}
            </span>
          </div>

          {/* Add button */}
          <button
            onClick={() => onCreateDeal(stage)}
            aria-label={`Adicionar em ${config.label}`}
            className={cn(
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg",
              "text-gray-400 transition-all duration-150",
              "hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Total value */}
        <div className="mt-1.5 flex items-baseline gap-1 pl-4">
          <span className="text-[11px] font-medium text-gray-400">Total</span>
          <span className="text-[13px] font-bold tabular-nums text-gray-700">
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
              ? "border-blue-300 bg-blue-50/70 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.15)]"
              : cn("border-gray-200/60", style.columnBg)
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
                "flex flex-1 flex-col items-center justify-center gap-2 rounded-lg",
                "border-2 border-dashed border-gray-200 py-10",
                "text-gray-400 transition-all duration-150",
                "hover:border-gray-300 hover:text-gray-500 hover:bg-white/60"
              )}
            >
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-gray-100")}>
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
