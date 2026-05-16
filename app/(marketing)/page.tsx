import { Navbar } from "@/components/marketing/navbar";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Footer } from "@/components/marketing/footer";
import Link from "next/link";

function CtaBanner() {
  return (
    <section className="bg-blue-600 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Pronto para fechar mais negócios?
        </h2>
        <p className="mt-4 text-base text-blue-200 leading-relaxed">
          Crie sua conta grátis em menos de um minuto. Sem cartão de crédito.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-bold text-blue-600 shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
          >
            Começar grátis agora
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-blue-200 hover:text-white transition-colors"
          >
            Já tenho conta →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </>
  );
}
