"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Plus, TrendingUp, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { DealForm } from "@/components/pipeline/deal-form";
import type { DealFormData } from "@/components/pipeline/deal-form";
import { DealDetailSheet } from "@/components/pipeline/deal-detail-sheet";
import { createDeal, updateDeal, deleteDeal, moveDeal } from "@/app/actions/deals";
import type { Deal, DealStage, Lead } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatCurrency(value: number): string {
  if (value >= 1_000_000)
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (value >= 1_000)
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StatCard({ icon: Icon, label, value, accent }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean;
}) {
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

interface PipelineClientProps {
  initialDeals: Deal[];
  leads: Lead[];
}

export function PipelineClient({ initialDeals, leads }: PipelineClientProps) {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [formOpen, setFormOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [viewingDeal, setViewingDeal] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>("novo_lead");
  const [isPending, startTransition] = useTransition();

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
    startTransition(async () => {
      if (editingDeal) {
        // Otimista: atualiza localmente
        setDeals((prev) =>
          prev.map((d) =>
            d.id === editingDeal.id
              ? { ...d, title: data.title, value: data.value, leadId: data.leadId, stage: data.stage, deadline: data.deadline || undefined }
              : d
          )
        );
        setFormOpen(false);
        setEditingDeal(null);

        const result = await updateDeal(editingDeal.id, data);
        if (result.error) {
          toast.error(result.error);
          router.refresh(); // reverte para estado do banco
          return;
        }
        toast.success("Negócio atualizado!");
      } else {
        setFormOpen(false);
        const result = await createDeal(data);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Negócio criado!");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    // Otimista
    setDeals((prev) => prev.filter((d) => d.id !== id));
    setFormOpen(false);
    setEditingDeal(null);

    startTransition(async () => {
      const result = await deleteDeal(id);
      if (result.error) {
        toast.error(result.error);
        router.refresh();
        return;
      }
      toast.success("Negócio excluído.");
    });
  }

  function handleDealsChange(updated: Deal[]) {
    // Encontra o deal que mudou de estágio ou posição comparando com o estado atual
    const movedDeal = updated.find((u) => {
      const original = deals.find((d) => d.id === u.id);
      return original && (original.stage !== u.stage || original.position !== u.position);
    });

    if (!movedDeal) return;

    const original = deals.find((d) => d.id === movedDeal.id)!;

    // Atualização otimista imediata
    setDeals(updated);

    // Persiste no banco em background
    const affectedDeals = updated
      .filter((u) => {
        const orig = deals.find((d) => d.id === u.id);
        return u.id !== movedDeal.id && orig && orig.position !== u.position;
      })
      .map((u) => ({ id: u.id, position: u.position }));

    moveDeal(movedDeal.id, movedDeal.stage, movedDeal.position, affectedDeals)
      .then((result) => {
        if (result?.error) {
          toast.error("Erro ao salvar posição. Recarregando...");
          // Reverte para o estado anterior
          setDeals(deals);
          router.refresh();
        }
      });

    // Suprime warning de "não estamos usando startTransition aqui"
    void original;
  }

  const viewingLead = viewingDeal ? leads.find((l) => l.id === viewingDeal.leadId) : undefined;

  return (
    <div className="flex h-full flex-col gap-5">
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

      <div className="-mx-6 flex-1 overflow-x-auto px-6 pb-4">
        <PipelineBoard
          deals={deals}
          leads={leads}
          onDealsChange={handleDealsChange}
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
        isSubmitting={isPending}
      />

      <DealDetailSheet
        deal={detailSheetOpen ? viewingDeal : null}
        lead={viewingLead}
        onClose={() => { setDetailSheetOpen(false); setViewingDeal(null); }}
        onEdit={openEdit}
      />
    </div>
  );
}
