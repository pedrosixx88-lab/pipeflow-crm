"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DealCard } from "./deal-card";
import { STAGE_CONFIG } from "./pipeline-board";
import type { Deal, DealStage, Lead } from "@/types";

function formatColumnValue(total: number): string {
  if (total >= 1_000_000) {
    return `R$ ${(total / 1_000_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}M`;
  }
  if (total >= 1_000) {
    const k = total / 1_000;
    const formatted =
      k % 1 === 0
        ? k.toFixed(0)
        : k.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return `R$ ${formatted}k`;
  }
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface PipelineColumnProps {
  stage: DealStage;
  deals: Deal[];
  leads: Lead[];
  onCreateDeal: (stage: DealStage) => void;
  onEditDeal: (deal: Deal) => void;
}

export function PipelineColumn({
  stage,
  deals,
  leads,
  onCreateDeal,
  onEditDeal,
}: PipelineColumnProps) {
  const config = STAGE_CONFIG[stage];

  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
  const dealIds = deals.map((d) => d.id);

  return (
    <div className="flex w-[280px] flex-shrink-0 flex-col gap-2">
      {/* Column header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
              config.bgColor,
              config.color,
              "border",
              config.borderColor
            )}
          >
            {config.label}
          </span>
          <span className="flex-shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
            {deals.length}
          </span>
        </div>
        <button
          onClick={() => onCreateDeal(stage)}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label={`Adicionar negócio em ${config.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Value summary */}
      {deals.length > 0 && (
        <p className="px-1 text-xs font-medium text-gray-500">
          {formatColumnValue(totalValue)}
        </p>
      )}

      {/* Droppable column body */}
      <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-1 flex-col gap-2 rounded-xl border bg-gray-50 p-2 transition-colors",
            "min-h-[400px]",
            isOver ? "border-blue-300 bg-blue-50/60" : "border-gray-200"
          )}
        >
          {deals.map((deal) => {
            const lead = leads.find((l) => l.id === deal.leadId);
            return (
              <DealCard
                key={deal.id}
                deal={deal}
                lead={lead}
                onEdit={onEditDeal}
              />
            );
          })}

          {deals.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 py-8">
              <p className="text-xs text-gray-400">Nenhum negócio</p>
              <button
                onClick={() => onCreateDeal(stage)}
                className="text-xs text-blue-500 underline-offset-2 hover:underline"
              >
                Adicionar
              </button>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
