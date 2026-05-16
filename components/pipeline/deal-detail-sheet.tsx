"use client";

import { Building2, CalendarDays, Clock, Pencil, TriangleAlert } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STAGE_CONFIG } from "./pipeline-board";
import { formatDate } from "@/lib/utils";
import type { Deal, Lead } from "@/types";

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getDeadlineDiff(deadline: string): number {
  const now = new Date();
  const due = new Date(deadline);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface DealDetailSheetProps {
  deal: Deal | null;
  lead: Lead | undefined;
  onClose: () => void;
  onEdit: (deal: Deal) => void;
}

export function DealDetailSheet({
  deal,
  lead,
  onClose,
  onEdit,
}: DealDetailSheetProps) {
  if (!deal) return null;

  const config = STAGE_CONFIG[deal.stage];
  const deadlineDiff = deal.deadline ? getDeadlineDiff(deal.deadline) : null;
  const isDeadlineWarning = deadlineDiff !== null && deadlineDiff <= 7;
  const isDeadlineOverdue = deadlineDiff !== null && deadlineDiff <= 0;

  return (
    <Sheet open={Boolean(deal)} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px]">
        <SheetHeader className="border-b border-gray-200 px-6 py-5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                config.bgColor,
                config.color,
                config.borderColor
              )}
            >
              {config.label}
            </span>
          </div>
          <SheetTitle className="mt-1 text-lg font-bold leading-snug text-gray-900">
            {deal.title}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Detalhes do negócio {deal.title}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-5">
            {/* Value */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Valor
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {formatCurrency(deal.value)}
              </p>
            </div>

            {/* Lead */}
            {lead && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Lead
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.name}
                    </p>
                    {lead.company && (
                      <p className="text-xs text-gray-500">{lead.company}</p>
                    )}
                    {lead.role && (
                      <p className="text-xs text-gray-400">{lead.role}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Deadline */}
            {deal.deadline && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Prazo
                </p>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1.5 text-sm font-medium",
                    isDeadlineOverdue
                      ? "text-red-600"
                      : isDeadlineWarning
                      ? "text-amber-600"
                      : "text-gray-700"
                  )}
                >
                  {isDeadlineWarning ? (
                    <TriangleAlert className="h-4 w-4" />
                  ) : (
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                  )}
                  {formatDate(deal.deadline)}
                  {isDeadlineOverdue && (
                    <span className="ml-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      Vencido
                    </span>
                  )}
                  {!isDeadlineOverdue && isDeadlineWarning && deadlineDiff !== null && (
                    <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {deadlineDiff === 1 ? "amanhã" : `${deadlineDiff} dias`}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Criado em {formatDate(deal.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Atualizado em {formatDate(deal.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-200 px-6 py-4">
          <Button
            onClick={() => onEdit(deal)}
            className="gap-2"
            size="sm"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar Negócio
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
