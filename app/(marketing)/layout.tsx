import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PipeFlow CRM — Pipeline de vendas para PMEs e freelancers",
  description:
    "Organize seus leads, acompanhe negócios no Kanban e feche mais vendas. Simples como uma planilha, poderoso como um CRM enterprise. Grátis para começar.",
  openGraph: {
    title: "PipeFlow CRM — Pipeline de vendas para PMEs e freelancers",
    description:
      "Organize seus leads, acompanhe negócios no Kanban e feche mais vendas. Simples como uma planilha, poderoso como um CRM enterprise.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "PipeFlow CRM",
    description: "Pipeline de vendas para PMEs e freelancers. Grátis para começar.",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white text-gray-900">{children}</div>;
}
