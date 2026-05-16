"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Archive,
  Mail,
  Phone,
  Building2,
  User,
  Calendar,
  PhoneCall,
  MessageSquare,
  CalendarDays,
  StickyNote,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/leads/status-badge";
import { LeadForm } from "@/components/leads/lead-form";
import type { LeadFormValues } from "@/components/leads/lead-form";
import { MOCK_LEADS, MOCK_ACTIVITIES } from "@/lib/mock-data";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import type { Activity, ActivityType } from "@/types";

const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
  ligacao: <PhoneCall className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  reuniao: <CalendarDays className="h-4 w-4" />,
  nota: <StickyNote className="h-4 w-4" />,
};

const ACTIVITY_LABEL: Record<ActivityType, string> = {
  ligacao: "Ligação",
  email: "E-mail",
  reuniao: "Reunião",
  nota: "Nota",
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
  ligacao: "bg-green-100 text-green-700",
  email: "bg-blue-100 text-blue-700",
  reuniao: "bg-violet-100 text-violet-700",
  nota: "bg-amber-100 text-amber-700",
};

function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
        <MessageSquare className="mb-3 h-8 w-8 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">Sem atividades ainda</p>
        <p className="mt-1 text-xs text-gray-400">
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
      {/* linha vertical */}
      <div className="absolute left-[19px] top-0 h-full w-px bg-gray-200" />

      <div className="flex flex-col gap-5">
        {sorted.map((activity) => (
          <div key={activity.id} className="relative flex gap-4">
            {/* ícone do tipo */}
            <div
              className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${ACTIVITY_COLOR[activity.type]}`}
            >
              {ACTIVITY_ICON[activity.type]}
            </div>

            {/* conteúdo */}
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">
                  {ACTIVITY_LABEL[activity.type]}
                </span>
                <span className="text-xs text-gray-400">
                  {formatRelativeDate(activity.occurredAt)}
                </span>
                <span className="ml-auto text-xs text-gray-400">
                  {formatDate(activity.occurredAt)}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
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
        <User className="mb-4 h-12 w-12 text-gray-300" />
        <h2 className="text-lg font-semibold text-gray-900">Lead não encontrado</h2>
        <p className="mt-1 text-sm text-gray-500">
          O lead que você procura não existe ou foi removido.
        </p>
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
          ? {
              ...l,
              name: data.name,
              email: data.email,
              phone: data.phone,
              company: data.company,
              role: data.role,
              status: data.status,
              updatedAt: new Date().toISOString(),
            }
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

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb / back */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4 gap-1.5 text-gray-500 hover:text-gray-700"
        onClick={() => router.push("/leads")}
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Leads
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna esquerda — perfil */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Card de perfil */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            {/* Avatar / iniciais */}
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-600">
                {currentLead.name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <h1 className="mt-3 text-lg font-bold text-gray-900">
                {currentLead.name}
              </h1>
              {currentLead.role && (
                <p className="text-sm text-gray-500">{currentLead.role}</p>
              )}
              {currentLead.company && (
                <p className="text-sm font-medium text-gray-700">
                  {currentLead.company}
                </p>
              )}
              <div className="mt-3">
                <StatusBadge status={currentLead.status} />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Contatos */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <a
                  href={`mailto:${currentLead.email}`}
                  className="truncate text-blue-600 hover:underline"
                >
                  {currentLead.email}
                </a>
              </div>
              {currentLead.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="text-gray-700">{currentLead.phone}</span>
                </div>
              )}
              {currentLead.company && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="text-gray-700">{currentLead.company}</span>
                </div>
              )}
              {currentLead.role && (
                <div className="flex items-center gap-2.5 text-sm">
                  <User className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="text-gray-700">{currentLead.role}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
                <span className="text-gray-500">
                  Criado em {formatDate(currentLead.createdAt)}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Ações */}
            <div className="flex flex-col gap-2">
              <Button
                className="w-full gap-2"
                size="sm"
                onClick={() => setFormOpen(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar lead
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 text-gray-600"
                size="sm"
              >
                <Archive className="h-3.5 w-3.5" />
                Arquivar
              </Button>
            </div>
          </div>

          {/* Negócios vinculados (placeholder) */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700">
                Negócios vinculados
              </h3>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-xs text-gray-400">
                Nenhum negócio vinculado ainda.
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                Disponível no M7 — Pipeline UI.
              </p>
            </div>
          </div>
        </div>

        {/* Coluna direita — timeline de atividades */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Atividades
                </h2>
                <p className="text-xs text-gray-400">
                  {activities.length} registro{activities.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-1.5">
                {(
                  [
                    { type: "ligacao", icon: <PhoneCall className="h-3.5 w-3.5" />, label: "Ligação" },
                    { type: "email", icon: <Mail className="h-3.5 w-3.5" />, label: "E-mail" },
                    { type: "reuniao", icon: <CalendarDays className="h-3.5 w-3.5" />, label: "Reunião" },
                    { type: "nota", icon: <StickyNote className="h-3.5 w-3.5" />, label: "Nota" },
                  ] as const
                ).map(({ type, icon, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    title={`Registrar ${label}`}
                  >
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

      {/* Formulário de edição */}
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
