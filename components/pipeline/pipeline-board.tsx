"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { PipelineColumn } from "./pipeline-column";
import { DealCard } from "./deal-card";
import type { Deal, DealStage, Lead } from "@/types";

export const STAGE_CONFIG: Record<
  DealStage,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  novo_lead: {
    label: "Novo Lead",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  contato_realizado: {
    label: "Contato Realizado",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  proposta_enviada: {
    label: "Proposta Enviada",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  negociacao: {
    label: "Negociação",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  fechado_ganho: {
    label: "Fechado Ganho",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  fechado_perdido: {
    label: "Fechado Perdido",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

export const STAGE_ORDER: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

interface PipelineBoardProps {
  deals: Deal[];
  leads: Lead[];
  onDealsChange: (deals: Deal[]) => void;
  onCreateDeal: (stage: DealStage) => void;
  onEditDeal: (deal: Deal) => void;
}

export function PipelineBoard({
  deals,
  leads,
  onDealsChange,
  onCreateDeal,
  onEditDeal,
}: PipelineBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      if (activeId === overId) return;

      const activeDeal = deals.find((d) => d.id === activeId);
      if (!activeDeal) return;

      // Determine target stage — over can be a column id (stage) or a card id
      const overDeal = deals.find((d) => d.id === overId);
      const targetStage: DealStage = overDeal
        ? overDeal.stage
        : (overId as DealStage);

      if (!STAGE_ORDER.includes(targetStage)) return;

      const sourceStage = activeDeal.stage;

      if (sourceStage === targetStage) {
        // Reorder within same column
        const stageDeals = deals
          .filter((d) => d.stage === sourceStage)
          .sort((a, b) => a.position - b.position);

        const oldIndex = stageDeals.findIndex((d) => d.id === activeId);
        const newIndex = stageDeals.findIndex((d) => d.id === overId);

        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(stageDeals, oldIndex, newIndex).map(
          (d, i) => ({ ...d, position: i })
        );

        onDealsChange(
          deals.map((d) => {
            const updated = reordered.find((r) => r.id === d.id);
            return updated ?? d;
          })
        );
      } else {
        // Move to different column
        const targetDeals = deals
          .filter((d) => d.stage === targetStage)
          .sort((a, b) => a.position - b.position);

        const insertAtIndex = overDeal
          ? targetDeals.findIndex((d) => d.id === overId)
          : targetDeals.length;

        const newPosition =
          insertAtIndex >= 0 ? insertAtIndex : targetDeals.length;

        const updatedDeals = deals.map((d) => {
          if (d.id === activeId) {
            return { ...d, stage: targetStage, position: newPosition, updatedAt: new Date().toISOString() };
          }
          // Shift positions in target column
          if (d.stage === targetStage && d.position >= newPosition) {
            return { ...d, position: d.position + 1 };
          }
          return d;
        });

        onDealsChange(updatedDeals);
      }
    },
    [deals, onDealsChange]
  );

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;
  const activeLead = activeDeal
    ? leads.find((l) => l.id === activeDeal.leadId)
    : undefined;

  if (!mounted) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => {
          const stageDeals = deals
            .filter((d) => d.stage === stage)
            .sort((a, b) => a.position - b.position);
          return (
            <PipelineColumn
              key={stage}
              stage={stage}
              deals={stageDeals}
              leads={leads}
              onCreateDeal={onCreateDeal}
              onEditDeal={onEditDeal}
            />
          );
        })}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGE_ORDER.map((stage) => {
          const stageDeals = deals
            .filter((d) => d.stage === stage)
            .sort((a, b) => a.position - b.position);

          return (
            <PipelineColumn
              key={stage}
              stage={stage}
              deals={stageDeals}
              leads={leads}
              onCreateDeal={onCreateDeal}
              onEditDeal={onEditDeal}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeDeal && (
          <DealCard
            deal={activeDeal}
            lead={activeLead}
            onEdit={() => undefined}
            isDragging={false}
            isOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
