"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Users,
  Mail,
  Trash2,
  Shield,
  ShieldCheck,
  Clock,
  Crown,
  MoreHorizontal,
  Send,
  UserX,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  updateWorkspace,
  inviteMember,
  removeMember,
  updateMemberRole,
  revokeInvite,
} from "@/app/actions/workspace";
import type { WorkspaceMemberRow, WorkspaceInviteRow, WorkspaceRow } from "@/types/database";

const FREE_MEMBER_LIMIT = 2;

interface WorkspaceSettingsClientProps {
  workspace: WorkspaceRow;
  members: WorkspaceMemberRow[];
  invites: WorkspaceInviteRow[];
  currentUserId: string;
  isAdmin: boolean;
}

export function WorkspaceSettingsClient({
  workspace,
  members,
  invites,
  currentUserId,
  isAdmin,
}: WorkspaceSettingsClientProps) {
  const activeMembers = members.filter((m) => m.status === "active");
  const isPro = workspace.plan === "pro";
  const atLimit = !isPro && activeMembers.length >= FREE_MEMBER_LIMIT;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Configurações do Workspace
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gerencie o workspace, membros e convites.
        </p>
      </div>

      {/* Nome do workspace */}
      <WorkspaceNameCard workspace={workspace} isAdmin={isAdmin} />

      {/* Plano */}
      <PlanCard
        plan={workspace.plan}
        memberCount={activeMembers.length}
      />

      {/* Membros */}
      <MembersCard
        members={activeMembers}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        workspaceId={workspace.id}
      />

      {/* Convites pendentes */}
      {isAdmin && invites.length > 0 && (
        <PendingInvitesCard invites={invites} />
      )}

      {/* Formulário de convite */}
      {isAdmin && (
        <InviteCard
          workspaceId={workspace.id}
          atLimit={atLimit}
          isPro={isPro}
          memberCount={activeMembers.length}
        />
      )}
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────

function WorkspaceNameCard({
  workspace,
  isAdmin,
}: {
  workspace: WorkspaceRow;
  isAdmin: boolean;
}) {
  const [name, setName] = useState(workspace.name);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateWorkspace({ name });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Nome do workspace atualizado.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          Informações do workspace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ws-name">Nome</Label>
          <div className="flex gap-2">
            <Input
              id="ws-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin}
              maxLength={50}
            />
            {isAdmin && (
              <Button
                onClick={handleSave}
                disabled={isPending || name === workspace.name || name.trim().length < 2}
              >
                {isPending ? "Salvando…" : "Salvar"}
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">Slug</Label>
          <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {workspace.slug}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanCard({ plan, memberCount }: { plan: string; memberCount: number }) {
  const isPro = plan === "pro";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown className="h-4 w-4" />
          Plano atual
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{isPro ? "Pro" : "Free"}</span>
              <Badge variant={isPro ? "default" : "secondary"}>
                {isPro ? "Pro" : "Grátis"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {isPro
                ? "Membros ilimitados · Leads ilimitados"
                : `${memberCount} / ${FREE_MEMBER_LIMIT} membros · até 50 leads`}
            </p>
          </div>
          {!isPro && (
            <a
              href="/settings/billing"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              Fazer upgrade
            </a>
          )}
        </div>
        {!isPro && (
          <div className="mt-3">
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-1.5 rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${Math.min(100, (memberCount / FREE_MEMBER_LIMIT) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MembersCard({
  members,
  currentUserId,
  isAdmin,
  workspaceId,
}: {
  members: WorkspaceMemberRow[];
  currentUserId: string;
  isAdmin: boolean;
  workspaceId: string;
}) {
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMemberRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    if (!removeTarget) return;
    startTransition(async () => {
      const result = await removeMember({ memberId: removeTarget.id });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Membro removido.");
      }
      setRemoveTarget(null);
    });
  }

  function handleRoleChange(memberId: string, role: "admin" | "member") {
    startTransition(async () => {
      const result = await updateMemberRole({ memberId, role });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Papel atualizado.");
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Membros ({members.length})
          </CardTitle>
          <CardDescription>Membros ativos no workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map((member) => {
              const isCurrentUser = member.user_id === currentUserId;
              const displayName =
                member.invited_email ?? member.user_id?.slice(0, 8) + "…";

              return (
                <li
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <MemberAvatar name={displayName} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {displayName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-gray-400">(você)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.role === "admin" ? "Administrador" : "Membro"}
                      </p>
                    </div>
                  </div>

                  {isAdmin && !isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8",
                        )}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role === "member" ? (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, "admin")}
                          >
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            Promover a Admin
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, "member")}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Rebaixar a Membro
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => setRemoveTarget(member)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remover do workspace
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {isCurrentUser && (
                    <Badge variant="outline" className="text-xs">
                      {member.role === "admin" ? "Admin" : "Membro"}
                    </Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover membro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <strong>{removeTarget?.invited_email ?? "este membro"}</strong> do
              workspace? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Removendo…" : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function PendingInvitesCard({ invites }: { invites: WorkspaceInviteRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const appUrl = typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  function handleRevoke(inviteId: string) {
    startTransition(async () => {
      const result = await revokeInvite(inviteId);
      if (result?.error) toast.error(result.error);
      else toast.success("Convite revogado.");
    });
  }

  function handleCopy(token: string, inviteId: string) {
    const url = `${appUrl}/invite/${token}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Convites pendentes ({invites.length})
        </CardTitle>
        <CardDescription>Convites enviados aguardando aceitação.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {invites.map((invite) => {
            const expiresAt = new Date(invite.expires_at);
            const daysLeft = Math.ceil(
              (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );

            return (
              <li key={invite.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
                    <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {invite.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invite.role === "admin" ? "Admin" : "Membro"} · expira em{" "}
                      {daysLeft} dia{daysLeft !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Copiar link de convite"
                    onClick={() => handleCopy(invite.token, invite.id)}
                  >
                    {copiedId === invite.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    title="Revogar convite"
                    onClick={() => handleRevoke(invite.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function InviteCard({
  workspaceId,
  atLimit,
  isPro,
  memberCount,
}: {
  workspaceId: string;
  atLimit: boolean;
  isPro: boolean;
  memberCount: number;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [isPending, startTransition] = useTransition();
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  function handleInvite() {
    startTransition(async () => {
      const result = await inviteMember({ email, role, workspaceId });
      if (result?.error) {
        toast.error(result.error);
      } else {
        if (result?.warning && result?.inviteUrl) {
          toast.warning(result.warning);
          setInviteUrl(result.inviteUrl as string);
        } else {
          toast.success(`Convite enviado para ${email}!`);
        }
        setEmail("");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Send className="h-4 w-4" />
          Convidar membro
        </CardTitle>
        <CardDescription>
          {atLimit
            ? `Limite do plano Free atingido (${FREE_MEMBER_LIMIT} membros). Faça upgrade para Pro para convidar mais.`
            : "Envie um convite por e-mail. O link expira em 7 dias."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {atLimit && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Você atingiu o limite de {FREE_MEMBER_LIMIT} membros do plano Free.{" "}
              <a href="/settings/billing" className="font-medium underline">
                Upgrade para Pro
              </a>{" "}
              para membros ilimitados.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="invite-email">E-mail</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colaborador@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={atLimit}
            />
          </div>
          <div className="w-36 space-y-1">
            <Label htmlFor="invite-role">Papel</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "admin" | "member")}
              disabled={atLimit}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleInvite}
          disabled={isPending || atLimit || !email.includes("@")}
          className="w-full"
        >
          <Send className="mr-2 h-4 w-4" />
          {isPending ? "Enviando…" : "Enviar convite"}
        </Button>

        {inviteUrl && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="mb-1 text-xs font-medium text-blue-800 dark:text-blue-300">
              Link de convite (copie e envie manualmente):
            </p>
            <p className="break-all font-mono text-xs text-blue-700 dark:text-blue-400">
              {inviteUrl}
            </p>
            <button
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-2")}
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl);
                toast.success("Link copiado!");
              }}
            >
              <Copy className="mr-2 h-3 w-3" />
              Copiar link
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MemberAvatar({ name }: { name: string }) {
  const initials = name
    .split(/[@.\s]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${color}`}
    >
      {initials || "?"}
    </div>
  );
}
