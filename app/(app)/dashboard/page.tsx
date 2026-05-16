import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral do seu pipeline e métricas de vendas.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-blue-500/10">
          <LayoutDashboard className="size-7 text-blue-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Dashboard em construção
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          KPIs, gráfico de funil e negócios com prazo próximo serão implementados nos próximos milestones.
        </p>
        <div className="mt-4 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          M11 — Dashboard UI
        </div>
      </div>
    </div>
  );
}
