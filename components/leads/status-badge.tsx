import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  novo:              { label: "Novo",       className: "bg-blue-500/15 text-blue-400 border-blue-500/25 hover:bg-blue-500/15" },
  contato_realizado: { label: "Contatado",  className: "bg-violet-500/15 text-violet-400 border-violet-500/25 hover:bg-violet-500/15" },
  proposta_enviada:  { label: "Proposta",   className: "bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/15" },
  negociacao:        { label: "Negociação", className: "bg-orange-500/15 text-orange-400 border-orange-500/25 hover:bg-orange-500/15" },
  fechado_ganho:     { label: "Ganho",      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15" },
  fechado_perdido:   { label: "Perdido",    className: "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/15" },
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };
