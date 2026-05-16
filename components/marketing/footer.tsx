import Link from "next/link";

function PipeFlowLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600">
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
          <rect x="9" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
          <rect x="1" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
          <path
            d="M6 3.5H7.5C8.05 3.5 8.5 3.95 8.5 4.5V10.5C8.5 11.05 8.95 11.5 9.5 11.5H9"
            stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </svg>
      </div>
      <span className="text-sm font-semibold tracking-tight text-gray-900">PipeFlow</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-start gap-10 md:flex-row md:justify-between">
          {/* brand */}
          <div className="max-w-xs">
            <PipeFlowLogo />
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Pipeline de vendas para PMEs e freelancers. Simples, visual e acessível.
            </p>
          </div>

          {/* links */}
          <div className="flex flex-wrap gap-12">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Produto</p>
              <ul className="flex flex-col gap-2.5">
                <li><a href="#funcionalidades" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Funcionalidades</a></li>
                <li><a href="#precos" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Preços</a></li>
                <li><Link href="/register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Começar grátis</Link></li>
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Conta</p>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Entrar</Link></li>
                <li><Link href="/register" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Criar conta</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-gray-100 pt-6 sm:flex-row">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} PipeFlow. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacidade</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Termos de uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
