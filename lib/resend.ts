import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Em produção, troque por um domínio verificado no Resend Dashboard.
// Em desenvolvimento, use o sandbox: onboarding@resend.dev
export const FROM_EMAIL =
  process.env.NODE_ENV === "production"
    ? "PipeFlow CRM <noreply@pipeflow.app>"
    : "PipeFlow CRM <onboarding@resend.dev>";
