"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, Calendar, GripVertical, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deal, Lead } from "@/types";

const STAGE_ACCENT: Record<string, { bar: string; value: string }> = {
  novo_lead:         { bar: "bg-blue-500",    value: "text-blue-400" },
  contato_realizado: { bar: "bg-violet-500",  value: "text-violet-400" },
  proposta_enviada:  { bar: "bg-amber-500",   value: "text-amber-400" },
  negociacao:        { bar: "bg-orange-500",  value: "text-orange-400" },
  fechado_ganho:     { bar: "bg-emerald-500", value: "text-emerald-400" },
  fechado_perdido:   { bar: "bg-red-500",     value: "text-red-400" },
};

const AVATAR_COLORS = [
  "bg-blue-600", "bg-violet-600", "bg-emerald-600",
  "bg-amber-600", "bg-rose-600", "bg-cyan-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000)
    return `R$ ${(value / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;
  if (value >= 1_000)
    return `R$ ${(value / 1_000).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })}k`;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getDeadlineInfo(deadline: string | undefined): { label: string; urgent: boolean; overdue: boolean } | null {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  const d = new Date(deadline);
  const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  return { label, urgent: diff <= 7 && diff > 0, overdue: diff <= 0 };
}

const OWNER_NAME = "Pedro Alves";

interface DealCardProps {
  deal: Deal;
  lead: Lead | undefined;
  onEdit: (deal: Deal) => void;
  isDragging?: boolean;
  isOverlay?: boolean;
}

export function DealCard({ deal, lead, onEdit, isDragging = false, isOverlay = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: deal.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const accent = STAGE_ACCENT[deal.stage] ?? STAGE_ACCENT.novo_lead;
  const deadlineInfo = getDeadlineInfo(deal.deadline);
  const isGhost = isDragging || isSortableDragging;

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={isOverlay ? undefined : style}
      className={cn(
        "group relative flex cursor-pointer select-none flex-col gap-0 rounded-xl",
        "border border-white/[0.07] bg-card",
        "shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]",
        "transition-all duration-150 ease-out",
        "hover:border-white/[0.14] hover:shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
        "hover:-translate-y-[2px]",
        isGhost && "opacity-25 scale-95",
        isOverlay && "rotate-[1.5deg] scale-[1.02] shadow-[0_20px_50px_rgba(0,0,0,0.6)] opacity-100"
      )}
      onClick={() => !isGhost && onEdit(deal)}
    >
      {/* Stage accent bar */}
      <div className={cn("h-[3px] w-full rounded-t-xl", accent.bar)} />

      <div className="flex flex-col gap-2.5 p-3">
        {/* Header: grip + title */}
        <div className="flex items-start gap-1.5">
          <div
            {...(isOverlay ? {} : attributes)}
            {...(isOverlay ? {} : listeners)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 flex-shrink-0 cursor-grab text-white/20 transition-colors group-hover:text-white/40 active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>
          <p className="flex-1 text-[13px] font-semibold leading-snug text-card-foreground line-clamp-2">
            {deal.title}
          </p>
        </div>

        {/* Value */}
        <div className="flex items-center gap-1.5 pl-5">
          <TrendingUp className={cn("h-3 w-3 flex-shrink-0", accent.value)} />
          <span className={cn("text-sm font-bold tabular-nums", accent.value)}>
            {formatCurrency(deal.value)}
          </span>
        </div>

        {/* Lead / Company */}
        {lead && (
          <div className="flex items-center gap-1.5 pl-5">
            <Building2 className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
            <p className="truncate text-[11px] leading-none">
              <span className="font-medium text-muted-foreground">{lead.name}</span>
              {lead.company && <span className="text-muted-foreground/50"> · {lead.company}</span>}
            </p>
          </div>
        )}

        {/* Footer: avatar + deadline */}
        <div className="flex items-center justify-between pl-5">
          <div
            className={cn(
              "flex h-[22px] w-[22px] items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-card",
              getAvatarColor(OWNER_NAME)
            )}
            title={OWNER_NAME}
          >
            {getInitials(OWNER_NAME)}
          </div>

          {deadlineInfo && (
            <span
              className={cn(
                "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
                deadlineInfo.overdue
                  ? "bg-red-500/20 text-red-400"
                  : deadlineInfo.urgent
                  ? "bg-amber-500/20 text-amber-400"
                  : "bg-white/[0.06] text-muted-foreground"
              )}
            >
              <Calendar className="h-2.5 w-2.5" />
              {deadlineInfo.overdue ? `Vencido ${deadlineInfo.label}` : deadlineInfo.label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
