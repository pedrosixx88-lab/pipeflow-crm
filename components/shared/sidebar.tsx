"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  CreditCard,
  ChevronDown,
  Check,
  Plus,
  Zap,
  X,
  Loader2,
} from "lucide-react";
import { switchWorkspace } from "@/app/actions/workspace";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "@/components/shared/logout-button";
import type { WorkspacePlan } from "@/types";

export interface SidebarWorkspace {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
}

export interface SidebarUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/settings/workspace", label: "Configurações", icon: Settings },
  { href: "/settings/billing", label: "Cobrança", icon: CreditCard },
];

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function PipeFlowLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-600/30">
        <svg
          width="15"
          height="15"
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
      <span className="text-sm font-semibold tracking-tight text-foreground">
        PipeFlow
      </span>
    </div>
  );
}

const WORKSPACE_COOKIE = "pf_workspace_id";

function getActiveCookieId(workspaces: SidebarWorkspace[]): string {
  if (typeof document === "undefined") return workspaces[0]?.id ?? "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${WORKSPACE_COOKIE}=([^;]+)`));
  const fromCookie = match?.[1];
  if (fromCookie && workspaces.some((w) => w.id === fromCookie)) return fromCookie;
  return workspaces[0]?.id ?? "";
}

function WorkspaceSelector({ workspaces }: { workspaces: SidebarWorkspace[] }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>(() => getActiveCookieId(workspaces));
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Sincroniza se o cookie mudar externamente (ex: aceite de convite em outra aba)
  useEffect(() => {
    setActiveId(getActiveCookieId(workspaces));
  }, [workspaces]);

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!active) return null;

  const initials = active.name.slice(0, 2).toUpperCase();

  function handleSwitch(wsId: string) {
    if (wsId === activeId) {
      setOpen(false);
      return;
    }
    setOpen(false);
    setActiveId(wsId);
    startTransition(async () => {
      await switchWorkspace(wsId);
    });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-70"
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-[10px] font-bold text-blue-400">
          {isPending ? <Loader2 className="size-3 animate-spin" /> : initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-sidebar-foreground">
            {active.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {active.plan === "pro" && (
            <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/15 text-blue-400">
              Pro
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </div>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-1 rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/30">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Workspaces
          </p>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSwitch(ws.id)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded bg-blue-500/15 text-[10px] font-bold text-blue-400">
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">
                  {ws.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {ws.plan === "pro" && (
                  <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/15 text-blue-400">
                    Pro
                  </span>
                )}
                {ws.id === active.id && (
                  <Check className="size-3 text-blue-500" />
                )}
              </div>
            </button>
          ))}
          <Separator className="my-1 opacity-50" />
          <Link
            href="/onboarding"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-3.5" />
            Novo workspace
          </Link>
        </div>
      )}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
        isActive
          ? "bg-blue-500/10 font-medium text-blue-400"
          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      {isActive && (
        <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-blue-500" />
      )}
      <Icon
        className={cn(
          "size-4 shrink-0 transition-colors",
          isActive
            ? "text-blue-500"
            : "text-muted-foreground group-hover:text-sidebar-foreground"
        )}
      />
      {label}
    </Link>
  );
}

interface SidebarContentProps {
  user: SidebarUser;
  workspaces: SidebarWorkspace[];
  onNavClick?: () => void;
}

function SidebarContent({ user, workspaces, onNavClick }: SidebarContentProps) {
  const activeWorkspace = workspaces[0];

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center px-4">
        <PipeFlowLogo />
      </div>

      <Separator className="opacity-40" />

      {/* Workspace selector */}
      <div className="shrink-0 px-3 py-3">
        <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Workspace
        </p>
        {workspaces.length > 0 ? (
          <WorkspaceSelector workspaces={workspaces} />
        ) : (
          <p className="px-2 text-xs text-muted-foreground">Nenhum workspace</p>
        )}
      </div>

      <Separator className="opacity-40" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} onClick={onNavClick} />
          ))}
        </div>
      </nav>

      <Separator className="opacity-40" />

      {/* Upgrade banner */}
      {activeWorkspace?.plan === "free" && (
        <div className="shrink-0 px-3 py-3">
          <div className="rounded-lg border border-blue-500/15 bg-blue-500/5 p-3">
            <div className="flex items-start gap-2">
              <Zap className="mt-0.5 size-3.5 shrink-0 text-blue-400" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sidebar-foreground">
                  Plano Free
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Upgrade para leads ilimitados
                </p>
                <Link
                  href="/settings/billing"
                  className="mt-2 inline-block text-[10px] font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Upgrade para Pro →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator className="opacity-40" />

      {/* User section */}
      <div className="shrink-0 px-3 py-3">
        <div className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent">
          <Avatar size="sm">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-blue-600/20 text-blue-400 text-[10px]">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-foreground">
              {user.fullName ?? "Usuário"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {user.email}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  user: SidebarUser;
  workspaces: SidebarWorkspace[];
}

export function Sidebar({ user, workspaces }: SidebarProps) {
  return (
    <aside data-sidebar className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <SidebarContent user={user} workspaces={workspaces} />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
  user,
  workspaces,
}: {
  open: boolean;
  onClose: () => void;
  user: SidebarUser;
  workspaces: SidebarWorkspace[];
}) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        data-sidebar
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-4 z-10 rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          aria-label="Fechar menu"
        >
          <X className="size-4" />
        </button>
        <SidebarContent user={user} workspaces={workspaces} onNavClick={onClose} />
      </div>
    </>
  );
}
