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
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  if (value >= 1_000_000)
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (value >= 1_000)
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  accent?: boolean;
}

function StatCard({ icon: Icon, label, value, accent }: StatCardProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border px-4 py-3",
      accent
        ? "border-emerald-500/20 bg-emerald-500/[0.08]"
        : "border-white/[0.07] bg-card shadow-[0_1px_3px_rgba(0,0,0,0.3)]"
    )}>
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg",
        accent ? "bg-emerald-500/15" : "bg-white/[0.06]"
      )}>
        <Icon className={cn("h-4 w-4", accent ? "text-emerald-400" : "text-muted-foreground")} />
      </div>
      <div>
        <p className={cn(
          "text-[10px] font-semibold uppercase tracking-wide",
          accent ? "text-emerald-500/80" : "text-muted-foreground/60"
        )}>
          {label}
        </p>
        <p className={cn(
          "text-sm font-bold tabular-nums",
          accent ? "text-emerald-400" : "text-card-foreground"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
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

  function handleDetailEdit(deal: Deal) {
    setDetailSheetOpen(false);
    setViewingDeal(null);
    openEdit(deal);
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Pipeline</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Acompanhe seus negócios em andamento</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatCard icon={BarChart3} label="Negócios ativos" value={String(activeDeals.length)} />
            <StatCard icon={TrendingUp} label="Valor em aberto" value={formatCurrency(totalPipeline)} />
            {wonDeals.length > 0 && (
              <StatCard icon={Trophy} label="Ganhos" value={formatCurrency(wonValue)} accent />
            )}
          </div>
        </div>
        <Button onClick={() => openCreate("novo_lead")} className="gap-2 self-start">
          <Plus className="h-4 w-4" />
          Novo Negócio
        </Button>
      </div>

      {/* Board */}
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
}
