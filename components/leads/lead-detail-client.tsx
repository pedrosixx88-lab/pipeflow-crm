"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Pencil, Archive, Mail, Phone, Building2, User,
  Calendar, PhoneCall, MessageSquare, CalendarDays, StickyNote, TrendingUp,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/leads/status-badge";
import { LeadForm } from "@/components/leads/lead-form";
import type { LeadFormValues } from "@/components/leads/lead-form";
import { updateLead, archiveLead, deleteLead } from "@/app/actions/leads";
import { formatDate, formatRelativeDate, cn } from "@/lib/utils";
import type { Lead, Activity, ActivityType, Deal, DealStage } from "@/types";
import { toast } from "sonner";

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

const STAGE_LABEL: Record<DealStage, string> = {
  novo_lead:         "Novo Lead",
  contato_realizado: "Contato Realizado",
  proposta_enviada:  "Proposta Enviada",
  negociacao:        "Negociação",
  fechado_ganho:     "Fechado Ganho",
  fechado_perdido:   "Fechado Perdido",
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

interface LeadDetailClientProps {
  lead: Lead;
  activities: Activity[];
  deals: Deal[];
}

export function LeadDetailClient({ lead, activities, deals }: LeadDetailClientProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials = lead.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  function handleUpdate(data: LeadFormValues, id?: string) {
    if (!id) return;
    startTransition(async () => {
      const result = await updateLead(id, data);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Lead atualizado!");
      setFormOpen(false);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteLead(id);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Lead excluído.");
      router.push("/leads");
    });
  }

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveLead(lead.id);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Lead arquivado.");
      router.push("/leads");
    });
  }

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
              <h1 className="mt-3 text-lg font-bold text-foreground">{lead.name}</h1>
              {lead.role && <p className="text-sm text-muted-foreground">{lead.role}</p>}
              {lead.company && <p className="text-sm font-medium text-foreground/80">{lead.company}</p>}
              <div className="mt-3"><StatusBadge status={lead.status} /></div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-3">
              {lead.email && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  <a href={`mailto:${lead.email}`} className="truncate text-blue-400 hover:underline">
                    {lead.email}
                  </a>
                </div>
              )}
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{lead.phone}</span>
                </div>
              )}
              {lead.company && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{lead.company}</span>
                </div>
              )}
              {lead.role && (
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                  <span className="text-muted-foreground">{lead.role}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 flex-shrink-0 text-muted-foreground/50" />
                <span className="text-muted-foreground/70">Criado em {formatDate(lead.createdAt)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col gap-2">
              <Button className="w-full gap-2" size="sm" onClick={() => setFormOpen(true)} disabled={isPending}>
                <Pencil className="h-3.5 w-3.5" />
                Editar lead
              </Button>
              <Button variant="outline" className="w-full gap-2" size="sm" onClick={handleArchive} disabled={isPending}>
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
            {deals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-xs text-muted-foreground/50">Nenhum negócio vinculado ainda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {deals.map((deal) => (
                  <div key={deal.id} className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs font-medium text-foreground">{deal.title}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{STAGE_LABEL[deal.stage]}</span>
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                        <DollarSign className="h-3 w-3" />
                        {deal.value.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        lead={lead}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        isSubmitting={isPending}
      />
    </div>
  );
}
