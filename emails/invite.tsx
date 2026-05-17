import * as React from "react";

interface InviteEmailProps {
  invitedByName: string;
  workspaceName: string;
  role: "admin" | "member";
  inviteUrl: string;
  expiresInDays?: number;
}

export function InviteEmail({
  invitedByName,
  workspaceName,
  role,
  inviteUrl,
  expiresInDays = 7,
}: InviteEmailProps) {
  const roleLabel = role === "admin" ? "Administrador" : "Membro";

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Convite para {workspaceName}</title>
      </head>
      <body
        style={{
          backgroundColor: "#f9fafb",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          margin: 0,
          padding: "40px 0",
        }}
      >
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ maxWidth: 560, margin: "0 auto" }}
        >
          <tbody>
            {/* Header */}
            <tr>
              <td
                style={{
                  backgroundColor: "#2563EB",
                  borderRadius: "8px 8px 0 0",
                  padding: "32px 40px",
                  textAlign: "center",
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
                  }}
                >
                  PipeFlow CRM
                </span>
              </td>
            </tr>

            {/* Body */}
            <tr>
              <td
                style={{
                  backgroundColor: "#ffffff",
                  padding: "40px",
                  borderLeft: "1px solid #e5e7eb",
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                <p
                  style={{
                    color: "#111827",
                    fontSize: 24,
                    fontWeight: 700,
                    margin: "0 0 8px",
                  }}
                >
                  Você foi convidado!
                </p>
                <p style={{ color: "#6b7280", fontSize: 15, margin: "0 0 24px" }}>
                  <strong style={{ color: "#374151" }}>{invitedByName}</strong> convidou
                  você para entrar no workspace{" "}
                  <strong style={{ color: "#374151" }}>{workspaceName}</strong> como{" "}
                  <strong style={{ color: "#374151" }}>{roleLabel}</strong>.
                </p>

                {/* CTA Button */}
                <table width="100%" cellPadding={0} cellSpacing={0}>
                  <tbody>
                    <tr>
                      <td style={{ textAlign: "center", padding: "8px 0 32px" }}>
                        <a
                          href={inviteUrl}
                          style={{
                            backgroundColor: "#2563EB",
                            borderRadius: 8,
                            color: "#ffffff",
                            display: "inline-block",
                            fontSize: 15,
                            fontWeight: 600,
                            padding: "14px 32px",
                            textDecoration: "none",
                          }}
                        >
                          Aceitar convite
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 8px" }}>
                  Ou copie e cole este link no seu navegador:
                </p>
                <p
                  style={{
                    backgroundColor: "#f3f4f6",
                    borderRadius: 6,
                    color: "#2563EB",
                    fontSize: 12,
                    overflowWrap: "break-word",
                    padding: "10px 14px",
                    margin: "0 0 24px",
                  }}
                >
                  {inviteUrl}
                </p>

                <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
                  Este convite expira em {expiresInDays} dias. Se você não esperava
                  receber este e-mail, pode ignorá-lo com segurança.
                </p>
              </td>
            </tr>

            {/* Footer */}
            <tr>
              <td
                style={{
                  backgroundColor: "#f9fafb",
                  borderRadius: "0 0 8px 8px",
                  borderLeft: "1px solid #e5e7eb",
                  borderRight: "1px solid #e5e7eb",
                  borderBottom: "1px solid #e5e7eb",
                  padding: "20px 40px",
                  textAlign: "center",
                }}
              >
                <p style={{ color: "#9ca3af", fontSize: 12, margin: 0 }}>
                  © {new Date().getFullYear()} PipeFlow CRM · Todos os direitos
                  reservados
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

/** Versão texto plano para clientes sem suporte a HTML */
export function inviteEmailText({
  invitedByName,
  workspaceName,
  role,
  inviteUrl,
  expiresInDays = 7,
}: InviteEmailProps): string {
  const roleLabel = role === "admin" ? "Administrador" : "Membro";
  return [
    `PipeFlow CRM — Convite para ${workspaceName}`,
    "",
    `${invitedByName} convidou você para o workspace "${workspaceName}" como ${roleLabel}.`,
    "",
    `Aceite o convite acessando o link abaixo:`,
    inviteUrl,
    "",
    `Este convite expira em ${expiresInDays} dias.`,
    "Se você não esperava este e-mail, ignore-o.",
  ].join("\n");
}
