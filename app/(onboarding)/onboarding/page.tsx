"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLogo } from "@/components/shared/auth-logo";
import { createWorkspaceAction } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Criando workspace...
        </>
      ) : (
        "Continuar"
      )}
    </Button>
  );
}

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    setError(null);
    const result = await createWorkspaceAction(formData);
    if (result?.error) {
      setError(result.error);
    }
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
        <form action={handleAction} className="flex flex-col gap-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
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
              name="workspaceName"
              type="text"
              placeholder="Ex: Acme Comercial, Minha Startup..."
              autoFocus
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <SubmitButton />
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Você pode alterar o nome do workspace depois nas configurações.
      </p>
    </div>
  );
}
