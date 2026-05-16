"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

function PipeFlowLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 shadow-md shadow-blue-600/25 transition-transform group-hover:scale-105">
        <svg width="16" height="16" viewBox="0 0 15 15" fill="none" aria-hidden="true">
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
      <span className="text-[15px] font-semibold tracking-tight text-gray-900 dark:text-white">PipeFlow</span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md shadow-sm shadow-gray-200/80 dark:shadow-black/40 border-b border-gray-100 dark:border-white/8"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <PipeFlowLogo />

        {/* desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#funcionalidades"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            Funcionalidades
          </a>
          <a
            href="#precos"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            Preços
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:text-gray-900 dark:hover:text-white"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-95"
          >
            Começar grátis
          </Link>
        </div>

        {/* mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-9 items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-white/8 md:hidden"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {mobileOpen ? (
              <>
                <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-100 dark:border-white/8 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <a href="#funcionalidades" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Funcionalidades
            </a>
            <a href="#precos" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Preços
            </a>
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100 dark:border-white/8">
              <Link href="/login" className="text-center rounded-lg border border-gray-200 dark:border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Entrar
              </Link>
              <Link href="/register" className="text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
