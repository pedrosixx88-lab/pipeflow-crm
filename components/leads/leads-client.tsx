"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadForm } from "@/components/leads/lead-form";
import type { LeadFormValues } from "@/components/leads/lead-form";
import { createLead, updateLead, deleteLead } from "@/app/actions/leads";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";
import { toast } from "sonner";

const QUICK_STATS = [
  { label: "Novos",      status: "novo"              as const },
  { label: "Contatados", status: "contato_realizado"  as const },
  { label: "Proposta",   status: "proposta_enviada"   as const },
  { label: "Negociação", status: "negociacao"         as const },
  { label: "Ganhos",     status: "fechado_ganho"      as const },
  { label: "Perdidos",   status: "fechado_perdido"    as const },
] as const;

interface LeadsClientProps {
  leads: Lead[];
  totalCount: number;
  statusCounts: Record<LeadStatus, number>;
  currentSearch: string;
  currentStatus: LeadStatus | "all";
}

export function LeadsClient({
  leads,
  totalCount,
  statusCounts,
  currentSearch,
  currentStatus,
}: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [isPending, startTransition] = useTransition();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openCreate() { setEditingLead(undefined); setFormOpen(true); }
  function openEdit(lead: Lead) { setEditingLead(lead); setFormOpen(true); }

  function updateSearchParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`/leads?${params.toString()}`);
  }

  const handleSearchChange = useCallback((search: string) => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      updateSearchParams({ search, page: "" });
    }, 400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function handleStatusChange(status: LeadStatus | "all") {
    updateSearchParams({ status: status === "all" ? "" : status, page: "" });
  }

  async function handleSubmit(data: LeadFormValues, id?: string) {
    startTransition(async () => {
      const result = id ? await updateLead(id, data) : await createLead(data);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(id ? "Lead atualizado!" : "Lead criado!");
      setFormOpen(false);
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteLead(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Lead excluído.");
      setFormOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalCount} lead{totalCount !== 1 ? "s" : ""} cadastrado{totalCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {QUICK_STATS.map(({ label, status }) => {
          const count = statusCounts[status] ?? 0;
          const isActive = currentStatus === status;
          return (
            <button
              key={status}
              onClick={() => handleStatusChange(isActive ? "all" : status)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-all duration-150",
                isActive
                  ? "border-blue-500/40 bg-blue-500/10 ring-1 ring-blue-500/30"
                  : "border-border bg-card hover:border-border/80 hover:bg-accent"
              )}
            >
              <p className={cn("text-xs font-medium", isActive ? "text-blue-400" : "text-muted-foreground")}>
                {label}
              </p>
              <p className={cn("mt-0.5 text-xl font-bold tabular-nums", isActive ? "text-blue-300" : "text-foreground")}>
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <LeadFilters
        search={currentSearch}
        onSearchChange={handleSearchChange}
        statusFilter={currentStatus}
        onStatusFilterChange={handleStatusChange}
        totalCount={totalCount}
        filteredCount={leads.length}
      />

      {/* Tabela */}
      <LeadTable leads={leads} onEdit={openEdit} />

      {/* Sheet */}
      <LeadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isPending}
      />
    </div>
  );
}
