import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { asTyped } from "@/lib/supabase/typed-client";
import { acceptInvite } from "@/app/actions/workspace";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;

  // Verifica se o usuário está logado
  const supabase = asTyped(await createClient());
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  // Busca dados do convite para exibir preview (sem aceitar ainda)
  const { data: invite } = await supabase
    .from("workspace_invites")
    .select("email, role, expires_at, accepted_at, workspace_id, workspaces(name, plan)")
    .eq("token", token)
    .single();

  // Convite inválido ou já aceito
  if (!invite) {
    return <InviteResult status="invalid" />;
  }

  if (invite.accepted_at) {
    return <InviteResult status="already_accepted" />;
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <InviteResult status="expired" />;
  }

  const workspace = Array.isArray(invite.workspaces)
    ? invite.workspaces[0]
    : invite.workspaces;
  const workspaceName = (workspace as { name: string } | null)?.name ?? "workspace";
  const workspacePlan = (workspace as { plan: string } | null)?.plan ?? "free";
  const roleLabel = invite.role === "admin" ? "Administrador" : "Membro";

  // Aceita automaticamente se o token e usuário são válidos
  const result = await acceptInvite(token);

  if (result.error) {
    return <InviteResult status="error" message={result.error} />;
  }

  if (result.alreadyMember) {
    return (
      <InviteResult
        status="already_member"
        workspaceName={workspaceName}
        workspaceId={invite.workspace_id}
      />
    );
  }

  return (
    <InviteResult
      status="success"
      workspaceName={workspaceName}
      workspaceId={invite.workspace_id}
      roleLabel={roleLabel}
      plan={workspacePlan}
    />
  );
}

// ── Componente de resultado ───────────────────────────────────────

type InviteStatus =
  | "success"
  | "already_member"
  | "already_accepted"
  | "invalid"
  | "expired"
  | "error";

function InviteResult({
  status,
  workspaceName,
  workspaceId,
  roleLabel,
  plan,
  message,
}: {
  status: InviteStatus;
  workspaceName?: string;
  workspaceId?: string;
  roleLabel?: string;
  plan?: string;
  message?: string;
}) {
  const configs: Record<
    InviteStatus,
    {
      icon: React.ReactNode;
      title: string;
      description: string;
      cta?: { label: string; href: string };
    }
  > = {
    success: {
      icon: <CheckCircle className="h-12 w-12 text-green-500" />,
      title: "Bem-vindo ao time!",
      description: `Você entrou em ${workspaceName ?? "workspace"} como ${roleLabel ?? "Membro"}.`,
      cta: { label: "Ir para o dashboard", href: "/dashboard" },
    },
    already_member: {
      icon: <Users className="h-12 w-12 text-blue-500" />,
      title: "Você já é membro",
      description: `Você já faz parte de ${workspaceName ?? "workspace"}.`,
      cta: { label: "Ir para o dashboard", href: "/dashboard" },
    },
    already_accepted: {
      icon: <CheckCircle className="h-12 w-12 text-green-400" />,
      title: "Convite já utilizado",
      description: "Este convite já foi aceito anteriormente.",
      cta: { label: "Ir para o dashboard", href: "/dashboard" },
    },
    invalid: {
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      title: "Convite inválido",
      description: "Este link de convite não existe ou foi removido.",
    },
    expired: {
      icon: <XCircle className="h-12 w-12 text-amber-500" />,
      title: "Convite expirado",
      description: "Este convite expirou. Peça ao administrador para enviar um novo.",
    },
    error: {
      icon: <XCircle className="h-12 w-12 text-red-500" />,
      title: "Não foi possível aceitar",
      description: message ?? "Ocorreu um erro inesperado. Tente novamente.",
    },
  };

  const cfg = configs[status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">{cfg.icon}</div>
          <CardTitle className="text-2xl">{cfg.title}</CardTitle>
          <CardDescription className="text-base mt-2">{cfg.description}</CardDescription>
        </CardHeader>

        {status === "success" && plan === "free" && (
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-md p-3">
              Este workspace usa o plano Free (máx. 2 membros). Faça upgrade para Pro
              para adicionar mais colaboradores ilimitados.
            </p>
          </CardContent>
        )}

        {cfg.cta && (
          <CardFooter className="justify-center">
            <Link href={cfg.cta.href} className={buttonVariants({ size: "lg" })}>
              {cfg.cta.label}
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
