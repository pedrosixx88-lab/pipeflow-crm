"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadStatus } from "@/types";
import { STATUS_CONFIG } from "@/components/leads/status-badge";

interface LeadFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: LeadStatus | "all";
  onStatusFilterChange: (value: LeadStatus | "all") => void;
  totalCount: number;
  filteredCount: number;
}

export function LeadFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  totalCount,
  filteredCount,
}: LeadFiltersProps) {
  const hasActiveFilters = search !== "" || statusFilter !== "all";

  function clearFilters() {
    onSearchChange("");
    onStatusFilterChange("all");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por nome ou empresa..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={statusFilter}
          onValueChange={(v) => onStatusFilterChange(v as LeadStatus | "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_CONFIG[status].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-gray-500">
            <X className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <span className="text-sm text-gray-500">
          {filteredCount} de {totalCount} leads
        </span>
      )}
    </div>
  );
}
