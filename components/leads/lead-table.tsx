"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, ExternalLink, Building2, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

  if (isLoading) {
    return <LeadTableSkeleton />;
  }

  if (leads.length === 0) {
    return <LeadEmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700">Empresa</TableHead>
            <TableHead className="font-semibold text-gray-700">Cargo</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Contato</TableHead>
            <TableHead className="font-semibold text-gray-700">Criado em</TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow
              key={lead.id}
              className="cursor-pointer transition-colors hover:bg-blue-50/40"
              onClick={() => router.push(`/leads/${lead.id}`)}
            >
              <TableCell className="font-medium text-gray-900">
                {lead.name}
              </TableCell>
              <TableCell>
                {lead.company ? (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    {lead.company}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>
                {lead.role ? (
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    {lead.role}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {lead.email}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(lead.createdAt)}
              </TableCell>
              <TableCell
                onClick={(e) => e.stopPropagation()}
                className="text-right"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEdit(lead)}
                      className="gap-2"
                    >
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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Nome</TableHead>
            <TableHead className="font-semibold text-gray-700">Empresa</TableHead>
            <TableHead className="font-semibold text-gray-700">Cargo</TableHead>
            <TableHead className="font-semibold text-gray-700">Status</TableHead>
            <TableHead className="font-semibold text-gray-700">Contato</TableHead>
            <TableHead className="font-semibold text-gray-700">Criado em</TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow key={i}>
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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <User className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-gray-900">
        Nenhum lead encontrado
      </h3>
      <p className="max-w-xs text-sm text-gray-500">
        Tente ajustar os filtros ou crie um novo lead para começar a acompanhar seu pipeline.
      </p>
    </div>
  );
}
