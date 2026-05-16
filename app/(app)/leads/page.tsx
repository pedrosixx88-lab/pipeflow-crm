import { Users } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Leads
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie seus contatos e potenciais clientes.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-xl bg-violet-500/10">
          <Users className="size-7 text-violet-400" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Gestão de Leads em construção
        </h3>
        <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
          Listagem com filtros, busca, formulário de criação e página de detalhe do lead.
        </p>
        <div className="mt-4 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
          M5 — Leads UI
        </div>
      </div>
    </div>
  );
}
