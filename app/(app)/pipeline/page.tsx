"use client";

import { useState } from "react";
import { BarChart3, Plus, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { DealForm } from "@/components/pipeline/deal-form";
import type { DealFormData } from "@/components/pipeline/deal-form";
import { DealDetailSheet } from "@/components/pipeline/deal-detail-sheet";
import { MOCK_DEALS, MOCK_LEADS } from "@/lib/mock-data";
import type { Deal, DealStage, Lead } from "@/types";

function formatCurrency(value: number): string {
  if (value >= 1_000_000)
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (value >= 1_000)
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`;
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

  const activeDeals = deals.filter((d) => d.stage !== "fechado_perdido");
  const wonDeals = deals.filter((d) => d.stage === "fechado_ganho");
  const totalPipeline = activeDeals.reduce((s, d) => s + d.value, 0);
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0);

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
              ? { ...d, title: data.title, value: data.value, leadId: data.leadId, stage: data.stage, deadline: data.deadline || undefined, updatedAt: new Date().toISOString() }
              : d
          )
        );
      } else {
        const stageDeals = deals.filter((d) => d.stage === data.stage);
        setDeals((prev) => [
          ...prev,
          {
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
          },
        ]);
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

  const viewingLead = viewingDeal ? leads.find((l) => l.id === viewingDeal.leadId) : undefined;

  return (
    <div className="flex h-full flex-col gap-5">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pipeline</h1>
            <p className="mt-0.5 text-sm text-gray-500">Acompanhe seus negócios em andamento</p>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Negócios ativos</p>
                <p className="text-sm font-bold tabular-nums text-gray-900">{activeDeals.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Valor em aberto</p>
                <p className="text-sm font-bold tabular-nums text-gray-900">{formatCurrency(totalPipeline)}</p>
              </div>
            </div>

            {wonDeals.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                  <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-emerald-600">Ganhos</p>
                  <p className="text-sm font-bold tabular-nums text-emerald-700">{formatCurrency(wonValue)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button onClick={() => openCreate("novo_lead")} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      {/* Board — negative margin to allow full-bleed horizontal scroll */}
      <div className="-mx-6 flex-1 overflow-x-auto px-6 pb-4">
        <PipelineBoard
          deals={deals}
          leads={leads}
          onDealsChange={setDeals}
          onCreateDeal={openCreate}
          onEditDeal={openDetail}
        />
      </div>

      <DealForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingDeal(null); }}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        deal={editingDeal}
        leads={leads}
        defaultStage={defaultStage}
        isSubmitting={isSubmitting}
      />

      <DealDetailSheet
        deal={detailSheetOpen ? viewingDeal : null}
        lead={viewingLead}
        onClose={() => { setDetailSheetOpen(false); setViewingDeal(null); }}
        onEdit={handleDetailEdit}
      />
    </div>
  );

  function handleDetailEdit(deal: Deal) {
    setDetailSheetOpen(false);
    setViewingDeal(null);
    openEdit(deal);
  }
}
