import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { queryDealsByWorkspace } from "@/lib/supabase/queries/deals";
import { PipelineClient } from "@/components/pipeline/pipeline-client";
import type { Deal, DealStage, Lead, LeadStatus } from "@/types";
import type { DealRow, LeadRow } from "@/types/database";

function rowToDeal(row: DealRow): Deal {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id ?? "",
    ownerId: row.owner_id ?? "",
    title: row.title,
    value: row.value,
    stage: row.stage as DealStage,
    position: row.position,
    deadline: row.deadline ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

export default async function PipelinePage() {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ws } = await supabase
    .from("workspaces")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!ws) redirect("/onboarding");

  const [dealsResult, leadsResult] = await Promise.all([
    queryDealsByWorkspace(supabase, ws.id),
    supabase
      .from("leads")
      .select("*")
      .eq("workspace_id", ws.id)
      .neq("status", "arquivado")
      .order("name"),
  ]);

  // queryDealsByWorkspace usa select com join — extraímos só o deal
  const deals: Deal[] = (dealsResult.data ?? []).map((row) => rowToDeal(row as unknown as DealRow));
  const leads: Lead[] = (leadsResult.data ?? []).map((row) => rowToLead(row as LeadRow));

  return <PipelineClient initialDeals={deals} leads={leads} />;
}
