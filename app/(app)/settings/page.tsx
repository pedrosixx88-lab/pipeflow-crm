import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Configurações
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie seu workspace, membros e assinatura.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-gray-500/10">
          <Settings className="size-7 text-gray-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Configurações em construção
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Workspace, membros, convites por e-mail e gerenciamento de assinatura.
        </p>
        <div className="mt-4 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          M13 — Workspace & M14 — Billing UI
        </div>
      </div>
    </div>
  );
}
