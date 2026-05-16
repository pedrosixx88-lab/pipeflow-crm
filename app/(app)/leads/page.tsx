"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadTable } from "@/components/leads/lead-table";
import { LeadFilters } from "@/components/leads/lead-filters";
import { LeadForm } from "@/components/leads/lead-form";
import type { LeadFormValues } from "@/components/leads/lead-form";
import { MOCK_LEADS } from "@/lib/mock-data";
import type { Lead, LeadStatus } from "@/types";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        search === "" ||
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        (lead.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  function openCreate() {
    setEditingLead(undefined);
    setFormOpen(true);
  }

  function openEdit(lead: Lead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  function handleSubmit(data: LeadFormValues, id?: string) {
    setIsSubmitting(true);
    setTimeout(() => {
      if (id) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === id
              ? {
                  ...l,
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  company: data.company,
                  role: data.role,
                  status: data.status,
                  updatedAt: new Date().toISOString(),
                }
              : l
          )
        );
      } else {
        const newLead: Lead = {
          id: `lead-${Date.now()}`,
          workspaceId: "ws-1",
          ownerId: "user-1",
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          role: data.role,
          status: data.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setLeads((prev) => [newLead, ...prev]);
      }
      setIsSubmitting(false);
      setFormOpen(false);
    }, 600);
  }

  function handleDelete(id: string) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setFormOpen(false);
  }

  const QUICK_STATS = [
    { label: "Novos", status: "novo" },
    { label: "Contatados", status: "contato_realizado" },
    { label: "Proposta", status: "proposta_enviada" },
    { label: "Negociação", status: "negociacao" },
    { label: "Ganhos", status: "fechado_ganho" },
    { label: "Perdidos", status: "fechado_perdido" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {leads.length} lead{leads.length !== 1 ? "s" : ""} cadastrado{leads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Quick stats clicáveis */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {QUICK_STATS.map(({ label, status }) => {
          const count = leads.filter((l) => l.status === status).length;
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(isActive ? "all" : status)}
              className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? "border-blue-300 bg-blue-50 ring-1 ring-blue-300"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="mt-0.5 text-xl font-bold text-gray-900">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Filtros */}
      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        totalCount={leads.length}
        filteredCount={filteredLeads.length}
      />

      {/* Tabela */}
      <LeadTable leads={filteredLeads} onEdit={openEdit} />

      {/* Formulário Sheet */}
      <LeadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
