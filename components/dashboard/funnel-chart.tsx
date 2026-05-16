"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DealStage } from "@/types";

interface StageData {
  stage: DealStage;
  label: string;
  count: number;
  value: number;
  color: string;
}

interface FunnelChartProps {
  data: StageData[];
}

function formatCurrency(value: number) {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return `R$ ${value}`;
}

interface TooltipPayload {
  payload: StageData;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2.5 shadow-md">
      <p className="mb-1 text-xs font-semibold text-foreground">{d.label}</p>
      <p className="text-xs text-muted-foreground">
        {d.count} {d.count === 1 ? "negócio" : "negócios"}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(d.value)}
      </p>
    </div>
  );
}

export function FunnelChart({ data }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        barSize={28}
      >
        <XAxis
          type="number"
          dataKey="count"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={148}
          tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]}>
          {data.map((entry) => (
            <Cell key={entry.stage} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
