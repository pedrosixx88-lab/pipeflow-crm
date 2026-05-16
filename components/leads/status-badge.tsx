import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/types";

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  novo: {
    label: "Novo",
    className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
  },
  contato_realizado: {
    label: "Contatado",
    className: "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100",
  },
  proposta_enviada: {
    label: "Proposta",
    className: "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  negociacao: {
    label: "Negociação",
    className: "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
  },
  fechado_ganho: {
    label: "Ganho",
    className: "bg-green-100 text-green-700 border-green-200 hover:bg-green-100",
  },
  fechado_perdido: {
    label: "Perdido",
    className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  },
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export { STATUS_CONFIG };
