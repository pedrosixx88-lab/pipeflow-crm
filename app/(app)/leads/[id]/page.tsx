"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Pencil, Archive, Mail, Phone, Building2, User,
  Calendar, PhoneCall, MessageSquare, CalendarDays, StickyNote, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/leads/status-badge";
import { LeadForm } from "@/components/leads/lead-form";
import type { LeadFormValues } from "@/components/leads/lead-form";
import { MOCK_LEADS, MOCK_ACTIVITIES } from "@/lib/mock-data";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Activity, ActivityType } from "@/types";

const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
  ligacao: <PhoneCall className="h-4 w-4" />,
  email:   <Mail className="h-4 w-4" />,
  reuniao: <CalendarDays className="h-4 w-4" />,
  nota:    <StickyNote className="h-4 w-4" />,
};

const ACTIVITY_LABEL: Record<ActivityType, string> = {
  ligacao: "Ligação",
  email:   "E-mail",
  reuniao: "Reunião",
  nota:    "Nota",
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
  ligacao: "bg-emerald-500/15 text-emerald-400",
  email:   "bg-blue-500/15 text-blue-400",
  reuniao: "bg-violet-500/15 text-violet-400",
  nota:    "bg-amber-500/15 text-amber-400",
};

function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
        <MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Sem atividades ainda</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Registre ligações, e-mails, reuniões ou notas sobre este lead.
        </p>
      </div>
    );
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-[19px] top-0 h-full w-px bg-border" />
      <div className="flex flex-col gap-5">
        {sorted.map((activity) => (
          <div key={activity.id} className="relative flex gap-4">
            <div className={cn(
              "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full",
              ACTIVITY_COLOR[activity.type]
            )}>
              {ACTIVITY_ICON[activity.type]}
            </div>
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {ACTIVITY_LABEL[activity.type]}
                </span>
                <span className="text-xs text-muted-foreground/60">
                  {formatRelativeDate(activity.occurredAt)}
                </span>
                <span className="ml-auto text-xs text-muted-foreground/50">
                  {formatDate(activity.occurredAt)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [leads, setLeads] = useState(MOCK_LEADS);
  const [formOpen, setFormOpen] = useState(false);

  const lead = leads.find((l) => l.id === id);
  const activities = MOCK_ACTIVITIES.filter((a) => a.leadId === id);

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <User className="mb-4 h-12 w-12 text-muted-foreground/30" />
        <h2 className="text-lg font-semibold text-foreground">Lead não encontrado</h2>
        <p className="mt-1 text-sm text-muted-foreground">O lead que você procura não existe ou foi removido.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/leads")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Leads
        </Button>
      </div>
    );
  }

  function handleUpdate(data: LeadFormValues, id?: string) {
    if (!id) return;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, name: data.name, email: data.email, phone: data.phone, company: data.company, role: data.role, status: data.status, updatedAt: new Date().toISOString() }
          : l
      )
    );
    setFormOpen(false);
  }

  function handleDelete(leadId: string) {
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
    router.push("/leads");
  }

  const currentLead = leads.find((l) => l.id === id) ?? lead;
  const initials = currentLead.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="mx-auto max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/leads")}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Leads
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Perfil */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-xl font-bold text-blue-400">
                {initials}
              </div>
              <h1 className="mt-3 text-lg font-bold text-foreground">{currentLead.name}</h1>
              {currentLead.role && <p className="text-sm text-muted-foreground">{currentLead.role}</p>}
              {currentLead.company && <p className="text-sm font-medium text-foreground/80">{currentLead.company}</p>}
              <div className="mt-3"><StatusBadge status={currentLead.status} /></div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                <a href={`mailto:${currentLead.email}`} className="truncate text-blue-400 hover:underline">
                  {currentLead.email}
                </a>
              </div>
              {currentLead.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{currentLead.phone}</span>
                </div>
              )}
              {currentLead.company && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{currentLead.company}</span>
                </div>
              )}
              {currentLead.role && (
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{currentLead.role}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                <span className="text-muted-foreground/70">Criado em {formatDate(currentLead.createdAt)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-2">
              <Button className="w-full gap-2" size="sm" onClick={() => setFormOpen(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Editar lead
              </Button>
              <Button variant="outline" className="w-full gap-2" size="sm">
                <Archive className="h-3.5 w-3.5" />
                Arquivar
              </Button>
            </div>
          </div>

          {/* Negócios vinculados */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
              <h3 className="text-sm font-semibold text-foreground">Negócios vinculados</h3>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-muted-foreground/50">Nenhum negócio vinculado ainda.</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-foreground">Atividades</h2>
                <p className="text-xs text-muted-foreground/60">
                  {activities.length} registro{activities.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-1.5">
                {([
                  { type: "ligacao", icon: <PhoneCall className="h-3.5 w-3.5" />, label: "Ligação" },
                  { type: "email",   icon: <Mail className="h-3.5 w-3.5" />,      label: "E-mail" },
                  { type: "reuniao", icon: <CalendarDays className="h-3.5 w-3.5" />, label: "Reunião" },
                  { type: "nota",    icon: <StickyNote className="h-3.5 w-3.5" />, label: "Nota" },
                ] as const).map(({ type, icon, label }) => (
                  <Button key={type} variant="outline" size="sm" className="gap-1.5 text-xs" title={`Registrar ${label}`}>
                    {icon}
                    <span className="hidden sm:inline">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>

      <LeadForm
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={currentLead}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
