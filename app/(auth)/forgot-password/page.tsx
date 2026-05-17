"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLogo } from "@/components/shared/auth-logo";
import { createClient } from "@/lib/supabase/client";

const forgotSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotFormData) {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    // Sempre mostra sucesso para não revelar se o e-mail existe
    setSubmittedEmail(data.email);
    setSent(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthLogo />

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground">
          {sent
            ? "Verifique sua caixa de entrada"
            : "Enviaremos um link para redefinir sua senha."}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-green-50">
              <MailCheck className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de recuperação para{" "}
              <span className="font-medium text-foreground">{submittedEmail}</span>.
              Verifique também a pasta de spam.
            </p>
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => setSent(false)}
            >
              Tentar outro e-mail
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
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
                  Enviando...
                </>
              ) : (
                "Enviar link de recuperação"
              )}
            </Button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link
          href="/login"
          className="font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Voltar ao login
        </Link>
      </p>
    </div>
  );
}
