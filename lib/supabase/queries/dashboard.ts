import type { TypedSupabaseClient } from "@/lib/supabase/typed-client";

const OPEN_STAGES = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
] as const;

type SimpleDeal = { id: string; stage: string; value: number };

export async function getDashboardMetrics(
  supabase: TypedSupabaseClient,
  workspaceId: string
) {
  const [leadsResult, dealsResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .neq("status", "arquivado"),
    supabase
      .from("deals")
      .select("id, stage, value")
      .eq("workspace_id", workspaceId),
  ]);

  const totalLeads = leadsResult.count ?? 0;
  const allDeals = (dealsResult.data ?? []) as SimpleDeal[];

  const openDeals = allDeals.filter((d) =>
    (OPEN_STAGES as readonly string[]).includes(d.stage)
  );
  const wonDeals = allDeals.filter((d) => d.stage === "fechado_ganho");
  const lostDeals = allDeals.filter((d) => d.stage === "fechado_perdido");
  const closedTotal = wonDeals.length + lostDeals.length;

  const pipelineValue = openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);
  const conversionRate =
    closedTotal > 0 ? Math.round((wonDeals.length / closedTotal) * 100) : 0;

  const funnelData = [
    { stage: "novo_lead",         label: "Novo Lead",         color: "#3b82f6" },
    { stage: "contato_realizado", label: "Contato Realizado", color: "#8b5cf6" },
    { stage: "proposta_enviada",  label: "Proposta Enviada",  color: "#f59e0b" },
    { stage: "negociacao",        label: "Negociação",        color: "#f97316" },
    { stage: "fechado_ganho",     label: "Fechado Ganho",     color: "#22c55e" },
    { stage: "fechado_perdido",   label: "Fechado Perdido",   color: "#ef4444" },
  ].map(({ stage, label, color }) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage);
    return {
      stage,
      label,
      color,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  });

  return {
    totalLeads,
    totalOpenDeals: openDeals.length,
    pipelineValue,
    conversionRate,
    funnelData,
  };
}

export type UpcomingDealRow = {
  id: string;
  workspace_id: string;
  lead_id: string | null;
  owner_id: string | null;
  title: string;
  value: number;
  stage: string;
  position: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  leads: { id: string; name: string; company: string | null } | null;
};

export async function getUpcomingDeals(
  supabase: TypedSupabaseClient,
  workspaceId: string
): Promise<UpcomingDealRow[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("deals")
    .select("*, leads(id, name, company)")
    .eq("workspace_id", workspaceId)
    .in("stage", [...OPEN_STAGES])
    .not("deadline", "is", null)
    .gte("deadline", today)
    .order("deadline", { ascending: true })
    .limit(5);

  return (data ?? []) as unknown as UpcomingDealRow[];
}
