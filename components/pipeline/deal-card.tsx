"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deal, Lead } from "@/types";

const STAGE_LEFT_BORDER: Record<string, string> = {
  novo_lead: "border-l-blue-500",
  contato_realizado: "border-l-violet-500",
  proposta_enviada: "border-l-amber-500",
  negociacao: "border-l-orange-500",
  fechado_ganho: "border-l-green-500",
  fechado_perdido: "border-l-red-500",
};

const STAGE_AVATAR_BG: Record<string, string> = {
  novo_lead: "bg-blue-500",
  contato_realizado: "bg-violet-500",
  proposta_enviada: "bg-amber-500",
  negociacao: "bg-orange-500",
  fechado_ganho: "bg-green-500",
  fechado_perdido: "bg-red-500",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getDeadlineStatus(
  deadline: string | undefined
): { label: string; className: string } | null {
  if (!deadline) return null;

  const now = new Date();
  const due = new Date(deadline);
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const day = due.getDate().toString().padStart(2, "0");
  const month = (due.getMonth() + 1).toString().padStart(2, "0");
  const label = `${day}/${month}`;

  if (diffDays <= 0) {
    return { label: `Vencido ${label}`, className: "bg-red-100 text-red-700" };
  }
  if (diffDays <= 3) {
    return { label, className: "bg-red-100 text-red-700" };
  }
  if (diffDays <= 7) {
    return { label, className: "bg-amber-100 text-amber-700" };
  }
  return { label, className: "bg-gray-100 text-gray-500" };
}

interface DealCardProps {
  deal: Deal;
  lead: Lead | undefined;
  onEdit: (deal: Deal) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export function DealCard({
  deal,
  lead,
  onEdit,
  isDragging = false,
  isOverlay = false,
}: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const deadlineStatus = getDeadlineStatus(deal.deadline);
  const leftBorderColor = STAGE_LEFT_BORDER[deal.stage] ?? "border-l-gray-300";

  const isBeingDragged = isDragging || isSortableDragging;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      onClick={() => onEdit(deal)}
      className={cn(
        "group relative cursor-pointer select-none rounded-lg border border-gray-200 bg-white p-3",
        "border-l-4",
        leftBorderColor,
        "shadow-sm transition-all duration-150",
        "hover:-translate-y-px hover:shadow-md",
        isBeingDragged && "opacity-40",
        isOverlay && "rotate-1 shadow-xl opacity-100"
      )}
    >
      {/* Title */}
      <p className="truncate text-sm font-medium text-gray-900 leading-snug">
        {deal.title}
      </p>

      {/* Value */}
      <p className="mt-1 text-sm font-bold text-blue-600">
        {formatCurrency(deal.value)}
      </p>

      {/* Lead info */}
      {lead && (
        <div className="mt-2 flex items-center gap-1.5">
          <Building2 className="h-3 w-3 flex-shrink-0 text-gray-400" />
          <p className="truncate text-xs text-gray-500">
            {lead.name}
            {lead.company && (
              <span className="text-gray-400"> · {lead.company}</span>
            )}
          </p>
        </div>
      )}

      {/* Bottom row: avatar + deadline */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        {/* Avatar */}
        <div
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white",
            STAGE_AVATAR_BG[deal.stage] ?? "bg-gray-400"
          )}
          title="Pedro Alves"
        >
          {getInitials("Pedro Alves")}
        </div>

        {/* Deadline badge */}
        {deadlineStatus && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
              deadlineStatus.className
            )}
          >
            <CalendarDays className="h-2.5 w-2.5" />
            {deadlineStatus.label}
          </span>
        )}
      </div>
    </div>
  );
}
