import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle, XCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  // Aceita o convite via RPC (security definer — sem necessidade de SELECT policy)
  const result = await acceptInvite(token);

  if (result.error) {
    const isExpired = result.error.includes("expirou");
    const isLimit = result.error.includes("limite");
    return (
      <InviteResult
        status={isExpired ? "expired" : isLimit ? "limit" : "error"}
        message={result.error}
      />
    );
  }

  if (result.alreadyMember) {
    return <InviteResult status="already_member" />;
  }

  return <InviteResult status="success" />;
}

// ── Componente de resultado ───────────────────────────────────────

type InviteStatus = "success" | "already_member" | "expired" | "limit" | "error";

function InviteResult({
  status,
  message,
}: {
  status: InviteStatus;
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
      description: "Você entrou no workspace com sucesso.",
      cta: { label: "Ir para o dashboard", href: "/dashboard" },
    },
    already_member: {
      icon: <Users className="h-12 w-12 text-blue-500" />,
      title: "Você já é membro",
      description: "Você já faz parte deste workspace.",
      cta: { label: "Ir para o dashboard", href: "/dashboard" },
    },
    expired: {
      icon: <XCircle className="h-12 w-12 text-amber-500" />,
      title: "Convite expirado",
      description: "Este convite expirou. Peça ao administrador para enviar um novo.",
    },
    limit: {
      icon: <XCircle className="h-12 w-12 text-amber-500" />,
      title: "Workspace cheio",
      description:
        message ??
        "O workspace atingiu o limite de membros do plano Free. O administrador precisa fazer upgrade para Pro.",
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
          <div className="mb-4 flex justify-center">{cfg.icon}</div>
          <CardTitle className="text-2xl">{cfg.title}</CardTitle>
          <CardDescription className="mt-2 text-base">{cfg.description}</CardDescription>
        </CardHeader>

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
