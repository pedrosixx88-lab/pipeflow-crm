import { Kanban } from "lucide-react";

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Pipeline
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualize e gerencie seus negócios no board Kanban.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-amber-500/10">
          <Kanban className="size-7 text-amber-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Pipeline Kanban em construção
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Board com 6 colunas, cards de negócios e drag-and-drop entre etapas.
        </p>
        <div className="mt-4 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          M7 — Pipeline UI
        </div>
      </div>
    </div>
  );
}
