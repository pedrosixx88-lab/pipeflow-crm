import {
  DollarSign,
  Kanban,
  PercentCircle,
  Users,
} from "lucide-react";
import type { DealStage } from "@/types";
import { MOCK_DEALS, MOCK_LEADS } from "@/lib/mock-data";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { UpcomingDeals } from "@/components/dashboard/upcoming-deals";

// ─── helpers ────────────────────────────────────────────────────────────────

const OPEN_STAGES: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
];

const STAGE_CONFIG: {
  stage: DealStage;
  label: string;
  color: string;
}[] = [
  { stage: "novo_lead",         label: "Novo Lead",          color: "#3b82f6" },
  { stage: "contato_realizado", label: "Contato Realizado",  color: "#8b5cf6" },
  { stage: "proposta_enviada",  label: "Proposta Enviada",   color: "#f59e0b" },
  { stage: "negociacao",        label: "Negociação",         color: "#f97316" },
  { stage: "fechado_ganho",     label: "Fechado Ganho",      color: "#22c55e" },
  { stage: "fechado_perdido",   label: "Fechado Perdido",    color: "#ef4444" },
];

function daysUntil(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── derivar métricas ────────────────────────────────────────────────────────

const totalLeads = MOCK_LEADS.length;

const openDeals = MOCK_DEALS.filter((d) => OPEN_STAGES.includes(d.stage));
const totalOpenDeals = openDeals.length;

const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);

const closedGanho = MOCK_DEALS.filter((d) => d.stage === "fechado_ganho").length;
const closedTotal = MOCK_DEALS.filter(
  (d) => d.stage === "fechado_ganho" || d.stage === "fechado_perdido"
).length;
const conversionRate =
  closedTotal > 0 ? Math.round((closedGanho / closedTotal) * 100) : 0;

// ─── dados para o funil ──────────────────────────────────────────────────────

const funnelData = STAGE_CONFIG.map(({ stage, label, color }) => {
  const stageDeals = MOCK_DEALS.filter((d) => d.stage === stage);
  return {
    stage,
    label,
    count: stageDeals.length,
    value: stageDeals.reduce((sum, d) => sum + d.value, 0),
    color,
  };
});

// ─── negócios com prazo próximo (top 5, excluindo fechados) ──────────────────

const leadMap = Object.fromEntries(MOCK_LEADS.map((l) => [l.id, l]));

const upcomingDeals = MOCK_DEALS.filter(
  (d) => d.deadline && OPEN_STAGES.includes(d.stage)
)
  .map((deal) => ({
    deal,
    lead: leadMap[deal.leadId],
    daysLeft: daysUntil(deal.deadline!),
  }))
  .filter((item) => item.lead)
  .sort((a, b) => a.daysLeft - b.daysLeft)
  .slice(0, 5);

// ─── page ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const pipelineFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(pipelineValue);

  return (
    <div className="flex flex-col gap-6">
      {/* header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral do seu pipeline e métricas de vendas.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total de Leads"
          value={String(totalLeads)}
          change={12}
          changeLabel="vs. mês anterior"
          icon={Users}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          title="Negócios Abertos"
          value={String(totalOpenDeals)}
          change={8}
          changeLabel="vs. mês anterior"
          icon={Kanban}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/10"
        />
        <KpiCard
          title="Valor do Pipeline"
          value={pipelineFormatted}
          change={23}
          changeLabel="vs. mês anterior"
          icon={DollarSign}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <KpiCard
          title="Taxa de Conversão"
          value={`${conversionRate}%`}
          change={-4}
          changeLabel="vs. mês anterior"
          icon={PercentCircle}
          iconColor="text-amber-400"
          iconBg="bg-amber-500/10"
        />
      </div>

      {/* funil + upcoming */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* gráfico de funil */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:col-span-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Funil de Vendas
            </h3>
            <p className="text-xs text-muted-foreground">
              Negócios por etapa do pipeline
            </p>
          </div>
          <FunnelChart data={funnelData} />
        </div>

        {/* negócios com prazo próximo */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Prazo Próximo
            </h3>
            <p className="text-xs text-muted-foreground">
              Negócios que precisam de atenção agora
            </p>
          </div>
          <UpcomingDeals items={upcomingDeals} />
        </div>
      </div>
    </div>
  );
}
