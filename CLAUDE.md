# PipeFlow CRM — Briefing do Projeto

> Documento de referência para o Claude Code. Leia antes de qualquer sessão de desenvolvimento.
> PRD completo em [docs/PRD.md](docs/PRD.md).

---

## Produto

**PipeFlow CRM** é uma plataforma web SaaS de gestão de clientes e vendas voltada para PMEs, freelancers e times comerciais. Oferece pipeline Kanban visual, gestão de leads, histórico de atividades, multi-empresa com RLS e monetização por assinatura (Free / Pro).

**Problema central:** times perdem negócios por falta de organização comercial. Soluções existentes (HubSpot, Pipedrive) são caras ou complexas demais.

**Diferencial:** simples como uma planilha, poderoso como um CRM enterprise — com modelo freemium acessível (R$49/mês Pro).

---

## Stack Técnica

| Camada | Tecnologia | Notas |
|--------|-----------|-------|
| Framework | **Next.js 14** (App Router) | Server Components por padrão |
| UI | **React 18** + **Tailwind CSS** + **shadcn/ui** | Componentes de `components/ui/` |
| Linguagem | **TypeScript 5** | `strict: true` sempre |
| Banco + Auth | **Supabase** (PostgreSQL + RLS + Auth) | Isolamento por workspace via RLS |
| Pagamento | **Stripe** | Checkout Sessions + Webhooks |
| E-mail | **Resend** | Convites de workspace |
| Drag-and-drop | **@dnd-kit** | Pipeline Kanban |
| Gráficos | **Recharts** | Dashboard de funil |
| Deploy | **Vercel** (frontend) + **Supabase** (backend) | |

---

## Estrutura de Pastas

```
class-pipeflow-crm/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Rotas públicas: login, cadastro
│   ├── (app)/                  # Rotas protegidas (requer auth)
│   │   ├── dashboard/
│   │   ├── leads/
│   │   ├── pipeline/
│   │   ├── settings/
│   │   └── layout.tsx          # Layout com sidebar
│   ├── api/                    # API Routes
│   │   ├── stripe/
│   │   └── webhooks/
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # shadcn/ui (gerado, não editar manualmente)
│   ├── leads/                  # Componentes de leads
│   ├── pipeline/               # Kanban board e cards
│   ├── dashboard/              # Gráficos e métricas
│   └── shared/                 # Sidebar, header, modais globais
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase client (browser)
│   │   ├── server.ts           # Supabase client (server)
│   │   └── middleware.ts       # Auth middleware
│   ├── stripe.ts               # Stripe client + helpers
│   ├── resend.ts               # Resend client
│   └── utils.ts                # Utilitários gerais (cn, formatters)
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript types e interfaces
│   ├── database.ts             # Tipos gerados do Supabase
│   └── index.ts                # Types do domínio
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── functions/              # Edge Functions (webhooks Stripe)
├── docs/
│   └── PRD.md                  # Product Requirements Document
├── public/                     # Assets estáticos
├── CLAUDE.md                   # Este arquivo
├── .env.local                  # Variáveis de ambiente (nunca commitar)
└── middleware.ts               # Next.js middleware (proteção de rotas)
```

---

## Convenções de Código

### Nomenclatura
- **Arquivos/pastas**: `kebab-case` (ex: `lead-card.tsx`, `use-pipeline.ts`)
- **Componentes React**: `PascalCase` (ex: `LeadCard`, `PipelineBoard`)
- **Funções/variáveis**: `camelCase`
- **Tipos/interfaces**: `PascalCase` com sufixo descritivo (ex: `LeadRow`, `WorkspaceWithPlan`)
- **Constantes**: `UPPER_SNAKE_CASE`

### React / Next.js
- **Server Components por padrão** — só adicionar `"use client"` quando necessário (interatividade, hooks, browser APIs)
- **Async Server Components** para busca de dados no servidor
- **Route Handlers** em `app/api/` para endpoints de API
- Nunca expor chaves secretas no client — usar Server Actions ou Route Handlers
- Prefira `import type` para importar apenas tipos TypeScript

### Supabase
- Usar `createServerClient` (SSR) em Server Components e Route Handlers
- Usar `createBrowserClient` apenas em Client Components
- Toda query deve respeitar RLS — nunca usar `service_role` no frontend
- Tipos do banco gerados via `supabase gen types typescript`

### Tailwind / shadcn
- Usar `cn()` de `lib/utils.ts` para mesclar classes condicionais
- Componentes shadcn ficam em `components/ui/` — não editar diretamente, estender via wrapper
- Evitar estilos inline; preferir classes Tailwind

### TypeScript
- `strict: true` no `tsconfig.json`
- Sem `any` — usar `unknown` quando o tipo não é conhecido e fazer type guard
- Definir tipos de retorno explícitos em funções de utilidade pública

---

## Identidade Visual

### Paleta de Cores
| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#2563EB` (blue-600) | CTAs, links, foco |
| `primary-dark` | `#1D4ED8` (blue-700) | Hover de CTAs |
| `success` | `#16A34A` (green-600) | Fechado Ganho, métricas positivas |
| `danger` | `#DC2626` (red-600) | Fechado Perdido, erros |
| `warning` | `#D97706` (amber-600) | Prazos próximos, alertas |
| `neutral` | `#6B7280` (gray-500) | Textos secundários |
| `background` | `#F9FAFB` (gray-50) | Fundo da app |
| `surface` | `#FFFFFF` | Cards, modais, sidebar |

### Tipografia
- **Fonte**: Inter (via `next/font/google`)
- **Hierarquia**: `text-2xl font-bold` (títulos de página) → `text-lg font-semibold` (seções) → `text-sm` (corpo)

### Etapas do Pipeline (cores dos cards)
| Etapa | Cor |
|-------|-----|
| Novo Lead | blue-100 / blue-600 |
| Contato Realizado | violet-100 / violet-600 |
| Proposta Enviada | amber-100 / amber-600 |
| Negociação | orange-100 / orange-600 |
| Fechado Ganho | green-100 / green-600 |
| Fechado Perdido | red-100 / red-600 |

### Princípios de Design
- **Clareza primeiro**: interface limpa, sem sobrecarga cognitiva
- **Ação visível**: CTAs sempre claros, estado do pipeline sempre visível
- **Responsivo**: funcional em desktop (prioridade) e mobile
- **Referências**: HubSpot CRM (estrutura), Pipedrive (pipeline UX)

---

## Planos e Limites

| Feature | Free | Pro |
|---------|------|-----|
| Colaboradores | até 2 | Ilimitado |
| Leads | até 50 | Ilimitado |
| Workspaces | 1 | Ilimitado |
| Pipeline Kanban | ✓ | ✓ |
| Dashboard | ✓ | ✓ |
| Preço | Grátis | R$49/mês |

Limites enforçados via middleware e verificação do plano no servidor antes de operações de criação.

---

## Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Apenas server-side

# Stripe
STRIPE_SECRET_KEY=               # Apenas server-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=           # Apenas server-side
STRIPE_PRO_PRICE_ID=             # ID do preço Pro no Stripe

# Resend
RESEND_API_KEY=                  # Apenas server-side

# App
NEXT_PUBLIC_APP_URL=             # URL base (ex: https://pipeflow.app)
```

---

## Milestones de Desenvolvimento

1. **Setup & Auth** — Next.js 14, Supabase, autenticação, layout base com sidebar
2. **Workspace & Multi-empresa** — Criação, convites, RLS, alternância
3. **Leads & Contatos** — CRUD, listagem com filtros, página de detalhe
4. **Pipeline Kanban** — Colunas, cards, drag-and-drop (@dnd-kit), persistência
5. **Atividades & Timeline** — Tipos (ligação, e-mail, reunião, nota), timeline
6. **Dashboard** — Métricas KPI, gráfico Recharts, negócios próximos do prazo
7. **Monetização** — Stripe Checkout, webhooks, Customer Portal, guards de plano
8. **Landing Page** — Página pública: hero, features, planos, CTA
9. **Onboarding** — Fluxo guiado pós-cadastro
10. **Polimento & Deploy** — Testes, performance, deploy Vercel + Supabase prod

> Sempre testar cada milestone antes de avançar para o próximo.
