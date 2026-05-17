"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLogo } from "@/components/shared/auth-logo";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceRow } from "@/types/database";

const onboardingSchema = z.object({
  workspaceName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { workspaceName: "" },
  });

  async function onSubmit(data: OnboardingFormData) {
    setServerError(null);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setServerError("Sessão expirada. Faça login novamente.");
      return;
    }

    const baseSlug = slugify(data.workspaceName);

    async function insertWorkspace(slug: string) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (supabase.from("workspaces") as any)
        .insert({ name: data.workspaceName, slug })
        .select("id")
        .single() as Promise<{ data: Pick<WorkspaceRow, "id"> | null; error: { code: string; message: string } | null }>;
    }

    // Cria workspace — o trigger on_workspace_created registra o criador como admin ativo
    let { data: workspace, error: wsError } = await insertWorkspace(baseSlug);

    if (wsError) {
      // Slug duplicado: tenta com sufixo randômico
      if (wsError.code === "23505") {
        const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
        const retry = await insertWorkspace(slug);
        workspace = retry.data;
        if (retry.error || !workspace) {
          setServerError("Erro ao criar workspace. Tente novamente.");
          return;
        }
      } else {
        setServerError("Erro ao criar workspace. Tente novamente.");
        return;
      }
    }

    if (!workspace) {
      setServerError("Erro ao criar workspace. Tente novamente.");
      return;
    }

    // Marca perfil como onboarded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("profiles") as any)
      .update({ onboarded: true })
      .eq("id", user.id);

    router.refresh();
    router.push("/dashboard");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <AuthLogo />
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bem-vindo ao PipeFlow!
          </h1>
          <p className="text-sm text-muted-foreground">
            Vamos configurar seu espaço de trabalho. Leva menos de um minuto.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
            1
          </div>
          <span className="text-xs font-medium text-foreground">Workspace</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            2
          </div>
          <span className="text-xs text-muted-foreground">Equipe</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            3
          </div>
          <span className="text-xs text-muted-foreground">Primeiro lead</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Dê um nome ao seu workspace
              </h2>
              <p className="text-sm text-muted-foreground">
                Pode ser o nome da sua empresa, time ou projeto.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="workspaceName">Nome do workspace</Label>
            <Input
              id="workspaceName"
              type="text"
              placeholder="Ex: Acme Comercial, Minha Startup..."
              autoFocus
              aria-invalid={!!errors.workspaceName}
              {...register("workspaceName")}
            />
            {errors.workspaceName && (
              <p className="text-xs text-red-500">{errors.workspaceName.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando workspace...
              </>
            ) : (
              "Continuar"
            )}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Você pode alterar o nome do workspace depois nas configurações.
      </p>
    </div>
  );
}
