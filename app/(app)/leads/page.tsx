import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { getActiveWorkspaceId } from "@/lib/supabase/get-active-workspace";
import { queryLeads } from "@/lib/supabase/queries/leads";
import { LeadsClient } from "@/components/leads/leads-client";
import type { Lead, LeadStatus } from "@/types";
import type { LeadRow } from "@/types/database";

function rowToLead(row: LeadRow): Lead {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    ownerId: row.owner_id ?? "",
    name: row.name,
    email: row.email ?? "",
    phone: row.phone ?? undefined,
    company: row.company ?? undefined,
    role: row.role ?? undefined,
    status: row.status as LeadStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface SearchParams {
  search?: string;
  status?: string;
  page?: string;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  if (!workspaceId) redirect("/onboarding");
  const ws = { id: workspaceId };

  const params = await searchParams;
  const search = params.search ?? "";
  const rawStatus = params.status ?? "";
  const status = (rawStatus as LeadStatus | "all") || "all";
  const page = Math.max(1, Number(params.page ?? 1));

  // Busca leads filtrados + contagem total (sem filtro de status) em paralelo
  const [filteredResult, allResult] = await Promise.all([
    queryLeads(supabase, ws.id, { search, status, page }),
    supabase
      .from("leads")
      .select("status", { count: "exact" })
      .eq("workspace_id", ws.id)
      .neq("status", "arquivado"),
  ]);

  const leads = (filteredResult.data ?? []).map(rowToLead);
  const totalCount = filteredResult.count ?? 0;

  // Calcula contagem por status para os quick stats
  const allLeadRows = allResult.data ?? [];
  const statusCounts = {
    novo: 0,
    contato_realizado: 0,
    proposta_enviada: 0,
    negociacao: 0,
    fechado_ganho: 0,
    fechado_perdido: 0,
  } as Record<LeadStatus, number>;

  for (const row of allLeadRows) {
    if (row.status in statusCounts) {
      statusCounts[row.status as LeadStatus]++;
    }
  }

  return (
    <LeadsClient
      leads={leads}
      totalCount={totalCount}
      statusCounts={statusCounts}
      currentSearch={search}
      currentStatus={status}
    />
  );
}
