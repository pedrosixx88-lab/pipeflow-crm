import { redirect } from "next/navigation";
import { DollarSign, Kanban, PercentCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { getActiveWorkspaceId } from "@/lib/supabase/get-active-workspace";
import { getDashboardMetrics, getUpcomingDeals, type UpcomingDealRow } from "@/lib/supabase/queries/dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { UpcomingDeals } from "@/components/dashboard/upcoming-deals";
import type { Deal, DealStage, Lead, LeadStatus } from "@/types";

export const revalidate = 30;

function daysUntil(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default async function DashboardPage() {
  const supabase = asTyped(await createClient());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const workspaceId = await getActiveWorkspaceId(supabase, user.id);
  if (!workspaceId) redirect("/onboarding");
  const ws = { id: workspaceId };

  const [metrics, upcomingRows] = await Promise.all([
    getDashboardMetrics(supabase, ws.id),
    getUpcomingDeals(supabase, ws.id),
  ]);

  // Mapeia os rows de upcoming deals para o formato esperado pelo componente
  const upcomingDeals = upcomingRows
    .filter((row) => row.deadline)
    .map((row: UpcomingDealRow) => {
      const leadJoin = row.leads;

      const deal: Deal = {
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

      const lead: Lead = {
        id: leadJoin?.id ?? "",
        workspaceId: ws.id,
        ownerId: "",
        name: leadJoin?.name ?? "—",
        email: "",
        company: leadJoin?.company ?? undefined,
        status: "novo" as LeadStatus,
        createdAt: "",
        updatedAt: "",
      };

      return { deal, lead, daysLeft: daysUntil(row.deadline!) };
    });

  const pipelineFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(metrics.pipelineValue);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral do seu pipeline e métricas de vendas.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total de Leads"
          value={String(metrics.totalLeads)}
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          title="Negócios Abertos"
          value={String(metrics.totalOpenDeals)}
          icon={Kanban}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
        />
        <KpiCard
          title="Valor do Pipeline"
          value={pipelineFormatted}
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          title="Taxa de Conversão"
          value={`${metrics.conversionRate}%`}
          icon={PercentCircle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* funil + upcoming */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:col-span-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Funil de Vendas</h3>
            <p className="text-xs text-muted-foreground">Negócios por etapa do pipeline</p>
          </div>
          <FunnelChart data={metrics.funnelData} />
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Prazo Próximo</h3>
            <p className="text-xs text-muted-foreground">Negócios que precisam de atenção agora</p>
          </div>
          <UpcomingDeals items={upcomingDeals} />
        </div>
      </div>
    </div>
  );
}
