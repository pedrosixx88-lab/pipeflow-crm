"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MobileSidebar, type SidebarUser, type SidebarWorkspace } from "@/components/shared/sidebar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/pipeline": "Pipeline",
  "/settings": "Configurações",
};

function getPageTitle(pathname: string): string {
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      return title;
    }
  }
  return "PipeFlow";
}

interface HeaderProps {
  user: SidebarUser;
  workspaces: SidebarWorkspace[];
}

export function Header({ user, workspaces }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <>
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        user={user}
        workspaces={workspaces}
      />

      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md">
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden text-muted-foreground"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-4" />
        </Button>

        {/* Page title */}
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>

        <div className="flex-1" />

        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 transition-all focus-within:border-blue-500/40 focus-within:bg-muted/50">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-40 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden rounded border border-border px-1 py-0.5 font-mono text-[9px] text-muted-foreground/50 lg:block">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground hover:text-foreground"
            aria-label="Notificações"
          >
            <Bell className="size-4" />
          </Button>
          <span
            className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-blue-500"
            aria-hidden="true"
          />
        </div>
      </header>
    </>
  );
}
