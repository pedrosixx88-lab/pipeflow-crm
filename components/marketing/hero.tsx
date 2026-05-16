import Link from "next/link";

const STATS = [
  { value: "+47%", label: "taxa de conversão" },
  { value: "3.2×", label: "leads qualificados" },
  { value: "−62%", label: "ciclo de venda" },
  { value: "1.200+", label: "times usando" },
];

const KANBAN_COLUMNS = [
  {
    title: "Novo Lead",
    color: "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50",
    dot: "bg-blue-500",
    cards: [
      { name: "Construtora BB", value: "R$ 120k", tag: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" },
      { name: "Fonseca Consultoria", value: "R$ 35k", tag: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300" },
    ],
  },
  {
    title: "Negociação",
    color: "bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800/50",
    dot: "bg-orange-500",
    cards: [
      { name: "TecNova Soluções", value: "R$ 78k", tag: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300" },
      { name: "Varejo 365", value: "R$ 91k", tag: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300" },
    ],
  },
  {
    title: "Fechado Ganho",
    color: "bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-800/50",
    dot: "bg-green-500",
    cards: [
      { name: "Marketing Pro", value: "R$ 18,5k", tag: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300" },
      { name: "Grupo Monteiro", value: "R$ 28k", tag: "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-300" },
    ],
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-28 pb-16 md:pt-36 md:pb-24">
      {/* subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#1e3a8a 1px, transparent 1px), linear-gradient(90deg, #1e3a8a 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* blue glow */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl"
        style={{ background: "rgba(37,99,235,0.08)" }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center text-center">
          {/* eyebrow badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/50 px-3.5 py-1.5">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-400 uppercase">
              CRM para times de vendas
            </span>
          </div>

          {/* headline */}
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl md:leading-[1.1]">
            Feche mais negócios.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-blue-600 dark:text-blue-400">Sem complicação.</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 -z-0 bg-blue-100 dark:bg-blue-900/50 rounded" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-500 dark:text-gray-400">
            Pipeline Kanban visual, gestão de leads e métricas em tempo real.
            Simples como uma planilha, poderoso como um CRM enterprise.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              Começar grátis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-80">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <a
              href="#funcionalidades"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-6 py-3 text-base font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/10 hover:shadow-md active:scale-95"
            >
              Ver funcionalidades
            </a>
          </div>

          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            Grátis para sempre · Sem cartão de crédito
          </p>
        </div>

        {/* kanban mockup */}
        <div className="mt-16 relative">
          <div className="pointer-events-none absolute inset-x-0 -bottom-8 h-40 bg-gradient-to-t from-white dark:from-gray-950 to-transparent z-10" />
          <div
            className="pointer-events-none absolute -inset-4 rounded-3xl -z-10 blur-xl"
            style={{ background: "rgba(37,99,235,0.06)" }}
          />

          <div className="overflow-hidden rounded-2xl border border-gray-200/80 dark:border-white/8 bg-gray-50 dark:bg-gray-900 shadow-2xl shadow-gray-300/40 dark:shadow-black/60">
            {/* mock browser bar */}
            <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/8 bg-white dark:bg-gray-800/60 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-red-400" />
                <div className="size-2.5 rounded-full bg-amber-400" />
                <div className="size-2.5 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto flex items-center gap-1.5 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-1 text-xs text-gray-500 dark:text-gray-400">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#2563EB" fillOpacity="0.8" />
                  <rect x="9" y="1" width="6" height="6" rx="1.5" fill="#2563EB" fillOpacity="0.3" />
                  <rect x="1" y="9" width="6" height="6" rx="1.5" fill="#2563EB" fillOpacity="0.3" />
                  <rect x="9" y="9" width="6" height="6" rx="1.5" fill="#2563EB" fillOpacity="0.8" />
                </svg>
                app.pipeflow.com.br/pipeline
              </div>
            </div>

            {/* kanban board */}
            <div className="p-4 overflow-x-auto">
              <div className="flex gap-3 min-w-max">
                {KANBAN_COLUMNS.map((col) => (
                  <div key={col.title} className="w-56 shrink-0">
                    <div className="mb-2.5 flex items-center gap-2 px-1">
                      <div className={`size-2 rounded-full ${col.dot}`} />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{col.title}</span>
                      <span className="ml-auto rounded-full bg-gray-200/80 dark:bg-white/10 px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {col.cards.length}
                      </span>
                    </div>
                    <div className={`rounded-xl border ${col.color} p-2 flex flex-col gap-2`}>
                      {col.cards.map((card) => (
                        <div
                          key={card.name}
                          className="rounded-lg bg-white dark:bg-gray-800 border border-white dark:border-white/8 shadow-sm p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">{card.name}</p>
                            <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${card.tag}`}>
                              {card.value}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="size-4 rounded-full bg-blue-600 flex items-center justify-center text-[7px] font-bold text-white">P</div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">Pedro Alves</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* stats strip */}
        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.value} className="text-center">
              <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{s.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
