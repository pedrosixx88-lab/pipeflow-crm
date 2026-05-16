const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" rx="1" /><rect x="10" y="3" width="5" height="5" rx="1" /><rect x="17" y="3" width="4" height="5" rx="1" />
        <rect x="3" y="10" width="5" height="5" rx="1" /><rect x="10" y="10" width="5" height="5" rx="1" />
        <rect x="3" y="17" width="5" height="4" rx="1" /><rect x="10" y="17" width="5" height="4" rx="1" />
      </svg>
    ),
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50",
    title: "Pipeline Kanban",
    description: "Board visual com drag-and-drop entre etapas. Veja o status de cada negócio em tempo real e mova deals com um clique.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/50",
    title: "Gestão de Leads",
    description: "Cadastre, filtre e acompanhe cada lead com histórico completo. Busca instantânea e filtros por status para encontrar qualquer contato.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50",
    title: "Dashboard de Métricas",
    description: "KPIs em tempo real: valor do pipeline, taxa de conversão, negócios por etapa. Gráfico de funil para identificar gargalos rapidamente.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/50",
    title: "Multi-empresa",
    description: "Gerencie múltiplos workspaces em uma única conta. Convide seu time, defina papéis de admin ou membro e colabore sem conflitos.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50",
    title: "Histórico de Atividades",
    description: "Registre ligações, e-mails, reuniões e notas em cada lead. Timeline cronológica para nunca perder o contexto de uma conversa.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    color: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/50",
    title: "Acesso em qualquer lugar",
    description: "Web app responsivo que funciona em desktop, tablet e mobile. Seus dados sincronizados em tempo real, de qualquer dispositivo.",
  },
];

export function Features() {
  return (
    <section id="funcionalidades" className="bg-gray-50 dark:bg-gray-900/50 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Funcionalidades
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Tudo que seu time precisa para vender mais
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Sem abas desnecessárias, sem curva de aprendizado. Cada feature foi
            desenhada para reduzir fricção e aumentar foco no que importa.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-gray-900 p-6 shadow-sm transition-all hover:border-gray-300 dark:hover:border-white/15 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${f.color} transition-transform group-hover:scale-105`}>
                {f.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
