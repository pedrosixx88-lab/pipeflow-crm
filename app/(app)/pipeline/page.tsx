"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { DealForm } from "@/components/pipeline/deal-form";
import type { DealFormData } from "@/components/pipeline/deal-form";
import { DealDetailSheet } from "@/components/pipeline/deal-detail-sheet";
import { MOCK_DEALS, MOCK_LEADS } from "@/lib/mock-data";
import type { Deal, DealStage, Lead } from "@/types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `R$ ${k % 1 === 0 ? k.toFixed(0) : k.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}k`;
  }
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [leads] = useState<Lead[]>(MOCK_LEADS);

  const [formOpen, setFormOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>("novo_lead");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalValue = deals
    .filter((d) => d.stage !== "fechado_perdido")
    .reduce((sum, d) => sum + d.value, 0);

  const activeDeals = deals.filter((d) => d.stage !== "fechado_perdido").length;

  function openCreate(stage: DealStage) {
    setEditingDeal(null);
    setDefaultStage(stage);
    setFormOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditingDeal(deal);
    setDefaultStage(deal.stage);
    setDetailSheetOpen(false);
    setViewingDeal(null);
    setFormOpen(true);
  }

  function openDetail(deal: Deal) {
    setViewingDeal(deal);
    setDetailSheetOpen(true);
  }

  function handleSubmit(data: DealFormData) {
    setIsSubmitting(true);
    setTimeout(() => {
      if (editingDeal) {
        setDeals((prev) =>
          prev.map((d) =>
            d.id === editingDeal.id
              ? {
                  ...d,
                  title: data.title,
                  value: data.value,
                  leadId: data.leadId,
                  stage: data.stage,
                  deadline: data.deadline || undefined,
                  updatedAt: new Date().toISOString(),
                }
              : d
          )
        );
      } else {
        const stageDeals = deals.filter((d) => d.stage === data.stage);
        const newDeal: Deal = {
          id: `deal-${Date.now()}`,
          workspaceId: "ws-1",
          leadId: data.leadId,
          ownerId: "user-1",
          title: data.title,
          value: data.value,
          stage: data.stage,
          position: stageDeals.length,
          deadline: data.deadline || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setDeals((prev) => [...prev, newDeal]);
      }
      setIsSubmitting(false);
      setFormOpen(false);
      setEditingDeal(null);
    }, 400);
  }

  function handleDelete(id: string) {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    setFormOpen(false);
    setEditingDeal(null);
  }

  function handleDetailEdit(deal: Deal) {
    setDetailSheetOpen(false);
    setViewingDeal(null);
    openEdit(deal);
  }

  const viewingLead = viewingDeal
    ? leads.find((l) => l.id === viewingDeal.leadId)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {activeDeals} negócio{activeDeals !== 1 ? "s" : ""} ativos
            {activeDeals > 0 && (
              <span className="ml-1 font-medium text-gray-700">
                · {formatCurrency(totalValue)} em aberto
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={() => openCreate("novo_lead")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      {/* Kanban board — full width with horizontal scroll */}
      <PipelineBoard
        deals={deals}
        leads={leads}
        onDealsChange={setDeals}
        onCreateDeal={openCreate}
        onEditDeal={openDetail}
      />

      {/* Create / Edit form */}
      <DealForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingDeal(null);
        }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        deal={editingDeal}
        leads={leads}
        defaultStage={defaultStage}
        isSubmitting={isSubmitting}
      />

      {/* Deal detail sheet */}
      <DealDetailSheet
        deal={detailSheetOpen ? viewingDeal : null}
        lead={viewingLead}
        onClose={() => {
          setDetailSheetOpen(false);
          setViewingDeal(null);
        }}
        onEdit={handleDetailEdit}
      />
    </div>
  );
}
