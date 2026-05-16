"use client";

import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, ExternalLink, Building2, User } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/leads/status-badge";
import type { Lead } from "@/types";
import { formatDate } from "@/lib/utils";

interface LeadTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onEdit: (lead: Lead) => void;
}

export function LeadTable({ leads, isLoading = false, onEdit }: LeadTableProps) {
  const router = useRouter();

  if (isLoading) return <LeadTableSkeleton />;
  if (leads.length === 0) return <LeadEmptyState />;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="font-semibold text-muted-foreground">Nome</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Empresa</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Cargo</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Contato</TableHead>
            <TableHead className="font-semibold text-muted-foreground">Criado em</TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer border-border transition-colors hover:bg-accent"
              onClick={() => router.push(`/leads/${lead.id}`)}
            >
              <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
              <TableCell>
                {lead.company ? (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground/50" />
                    {lead.company}
                  </span>
                ) : <span className="text-muted-foreground/40">—</span>}
              </TableCell>
              <TableCell>
                {lead.role ? (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5 text-muted-foreground/50" />
                    {lead.role}
                  </span>
                ) : <span className="text-muted-foreground/40">—</span>}
              </TableCell>
              <TableCell><StatusBadge status={lead.status} /></TableCell>
              <TableCell className="text-sm text-muted-foreground">{lead.email}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()} className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-accent hover:text-foreground focus:outline-none">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/leads/${lead.id}`)} className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(lead)} className="gap-2">
                      <Pencil className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LeadTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            {["Nome", "Empresa", "Cargo", "Status", "Contato", "Criado em"].map((h) => (
              <TableHead key={h} className="font-semibold text-muted-foreground">{h}</TableHead>
            ))}
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i} className="border-border">
              <TableCell><Skeleton className="h-4 w-36" /></TableCell>
              <TableCell><Skeleton className="h-4 w-28" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-40" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function LeadEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <User className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">Nenhum lead encontrado</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        Tente ajustar os filtros ou crie um novo lead para começar a acompanhar seu pipeline.
      </p>
    </div>
  );
}
