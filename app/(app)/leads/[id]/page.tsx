import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { queryLeadById } from "@/lib/supabase/queries/leads";
import { queryDealsByLead } from "@/lib/supabase/queries/deals";
import { LeadDetailClient } from "@/components/leads/lead-detail-client";
import type { Lead, LeadStatus, Activity, ActivityType, Deal, DealStage } from "@/types";
import type { LeadRow, DealRow } from "@/types/database";

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

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;

  const [leadResult, dealsResult, activitiesResult] = await Promise.all([
    queryLeadById(supabase, id),
    queryDealsByLead(supabase, id),
    supabase
      .from("activities")
      .select("*")
      .eq("lead_id", id)
      .order("occurred_at", { ascending: false }),
  ]);

  if (leadResult.error || !leadResult.data) notFound();

  const lead = rowToLead(leadResult.data);
  const deals = (dealsResult.data ?? []).map((row) => rowToDeal(row as DealRow));
  const activities: Activity[] = (activitiesResult.data ?? []).map((row) => ({
    id: row.id,
    workspaceId: row.workspace_id,
    leadId: row.lead_id,
    authorId: row.author_id ?? "",
    type: row.type as ActivityType,
    description: row.description,
    occurredAt: row.occurred_at,
    createdAt: row.created_at,
  }));

  return <LeadDetailClient lead={lead} activities={activities} deals={deals} />;
}
