import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
          <svg
            width="20"
            height="20"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="1" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
            <rect x="9" y="1" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
            <rect x="1" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.4" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.95" />
            <path
              d="M6 3.5H7.5C8.05 3.5 8.5 3.95 8.5 4.5V10.5C8.5 11.05 8.95 11.5 9.5 11.5H9"
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Criar conta no PipeFlow
        </h1>
        <p className="text-sm text-muted-foreground">
          Grátis para sempre. Sem cartão de crédito.
        </p>
      </div>

      {/* Form placeholder */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Nome completo</label>
            <input
              type="text"
              placeholder="Seu Nome"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Senha</label>
            <input
              type="password"
              placeholder="Mínimo 8 caracteres"
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Criar conta grátis
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            Ao criar uma conta, você concorda com nossos{" "}
            <span className="text-blue-400">Termos de Uso</span>.
          </p>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-400 transition-colors hover:text-blue-300"
        >
          Fazer login
        </Link>
      </p>
    </div>
  );
}
