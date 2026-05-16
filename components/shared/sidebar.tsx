"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Settings,
  ChevronDown,
  LogOut,
  Check,
  Plus,
  Zap,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  MOCK_WORKSPACES,
  MOCK_ACTIVE_WORKSPACE,
  MOCK_USER,
  MOCK_USER_EMAIL,
} from "@/lib/mock-data";
import type { Workspace } from "@/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/settings", label: "Configurações", icon: Settings },
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

function WorkspaceSelector() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Workspace>(MOCK_ACTIVE_WORKSPACE);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const initials = active.name.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-blue-500/15 text-[10px] font-bold text-blue-400">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-sidebar-foreground">
            {active.name}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {active.plan === "pro" && (
            <Badge className="h-4 rounded px-1 text-[9px] bg-blue-600/20 text-blue-400 border-none hover:bg-blue-600/20">
              Pro
            </Badge>
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
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl shadow-black/30">
          <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Workspaces
          </p>
          {MOCK_WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              onClick={() => {
                setActive(ws);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded bg-blue-500/15 text-[10px] font-bold text-blue-400">
                {ws.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{ws.name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {ws.plan === "pro" && (
                  <span className="rounded px-1 py-0.5 text-[9px] font-medium bg-blue-600/20 text-blue-400">
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
          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <Plus className="size-3.5" />
            Novo workspace
          </button>
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
        <span className="absolute left-0 inset-y-1.5 w-0.5 rounded-r-full bg-blue-500" />
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
  onNavClick?: () => void;
}

function SidebarContent({ onNavClick }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
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
        <WorkspaceSelector />
      </div>

      <Separator className="opacity-40" />

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} onClick={onNavClick} />
        ))}
      </nav>

      <Separator className="opacity-40" />

      {/* Upgrade banner */}
      <div className="shrink-0 px-3 py-3">
        <div className="rounded-lg border border-blue-500/15 bg-blue-500/5 p-3">
          <div className="flex items-start gap-2">
            <Zap className="mt-0.5 size-3.5 shrink-0 text-blue-400" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground">
                Plano Free
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                32 / 50 leads usados
              </p>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: "64%" }}
                />
              </div>
              <button className="mt-2 text-[10px] font-medium text-blue-400 transition-colors hover:text-blue-300">
                Upgrade para Pro →
              </button>
            </div>
          </div>
        </div>
      </div>

      <Separator className="opacity-40" />

      {/* User section */}
      <div className="shrink-0 px-3 py-3">
        <div className="group flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent">
          <Avatar size="sm">
            <AvatarImage src={MOCK_USER.avatarUrl} />
            <AvatarFallback className="bg-blue-600/20 text-blue-400 text-[10px]">
              {getInitials(MOCK_USER.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-foreground">
              {MOCK_USER.fullName}
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              {MOCK_USER_EMAIL}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
            title="Sair"
          >
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
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
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 border-r border-sidebar-border bg-sidebar transition-transform duration-200 ease-in-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          aria-label="Fechar menu"
        >
          <X className="size-4" />
        </button>
        <SidebarContent onNavClick={onClose} />
      </div>
    </>
  );
}
