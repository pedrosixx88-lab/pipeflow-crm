import Link from "next/link";

const FREE_FEATURES = [
  "Até 2 colaboradores",
  "Até 50 leads",
  "1 workspace",
  "Pipeline Kanban",
  "Dashboard de métricas",
  "Histórico de atividades",
];

const PRO_FEATURES = [
  "Colaboradores ilimitados",
  "Leads ilimitados",
  "Workspaces ilimitados",
  "Pipeline Kanban",
  "Dashboard de métricas",
  "Histórico de atividades",
  "Convites por e-mail",
  "Suporte prioritário",
];

function CheckIcon({ muted = false }: { muted?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 mt-0.5 ${muted ? "text-gray-400" : "text-emerald-500"}`}
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" fillOpacity={muted ? "0.12" : "0.12"} />
      <path
        d="M5 8l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pricing() {
  return (
    <section id="precos" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* heading */}
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600">
            Preços
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simples e transparente
          </h2>
          <p className="mt-4 text-base text-gray-500">
            Comece grátis. Faça upgrade quando precisar de mais.
          </p>
        </div>

        {/* cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {/* free */}
          <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Grátis</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">R$&nbsp;0</span>
                <span className="mb-1 text-sm text-gray-400">/mês</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">Para começar e validar o processo.</p>
            </div>

            <ul className="mb-8 flex flex-col gap-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckIcon muted />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Link
                href="/register"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-3 text-center text-sm font-semibold text-gray-800 transition-all hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm active:scale-95"
              >
                Começar grátis
              </Link>
            </div>
          </div>

          {/* pro */}
          <div className="relative flex flex-col rounded-2xl border-2 border-blue-600 bg-blue-600 p-8 shadow-xl shadow-blue-600/20">
            {/* popular badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 border-2 border-white px-3 py-1 text-xs font-bold text-white shadow-sm">
                <span className="size-1.5 rounded-full bg-white opacity-80 animate-pulse" />
                Mais popular
              </span>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-200">Pro</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-white">R$&nbsp;49</span>
                <span className="mb-1 text-sm text-blue-200">/mês</span>
              </div>
              <p className="mt-2 text-sm text-blue-200">Para times que querem crescer sem limite.</p>
            </div>

            <ul className="mb-8 flex flex-col gap-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-white">
                    <circle cx="8" cy="8" r="7" fill="white" fillOpacity="0.2" />
                    <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Link
                href="/register"
                className="block w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-blue-600 shadow-sm transition-all hover:bg-blue-50 hover:shadow-md active:scale-95"
              >
                Assinar Pro
              </Link>
              <p className="mt-3 text-center text-xs text-blue-300">
                Cancele quando quiser · Sem multa
              </p>
            </div>
          </div>
        </div>

        {/* comparison note */}
        <p className="mt-10 text-center text-sm text-gray-400">
          Precisa de um plano personalizado para enterprise?{" "}
          <a href="mailto:contato@pipeflow.com.br" className="font-medium text-blue-600 hover:underline">
            Fale com a gente
          </a>
        </p>
      </div>
    </section>
  );
}
