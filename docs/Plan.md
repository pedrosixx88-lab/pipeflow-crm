# PipeFlow CRM — Plano de Execução

> Estratégia: **interface primeiro, backend depois**. Cada milestone é uma entrega testável e incremental. Nunca avançar para o próximo sem validar o atual.

---

## Visão Geral dos Milestones

| # | Milestone | Branch | Foco |
|---|-----------|--------|------|
| 1 | Setup & Fundação | `feat/setup` | Projeto, tooling, design system |
| 2 | Layout & Navegação | `feat/layout` | Shell da app, sidebar, rotas |
| 3 | Auth — UI | `feat/auth-ui` | Telas de login/cadastro (estático) |
| 4 | Auth — Backend | `feat/auth-backend` | Supabase Auth, sessão, middleware |
| 5 | Leads — UI | `feat/leads-ui` | Listagem, filtros, detalhe, formulário |
| 6 | Leads — Backend | `feat/leads-backend` | CRUD real, RLS, busca |
| 7 | Pipeline — UI | `feat/pipeline-ui` | Kanban estático, cards, drag-and-drop |
| 8 | Pipeline — Backend | `feat/pipeline-backend` | Persistência, etapas, negócios |
| 9 | Atividades — UI | `feat/activities-ui` | Timeline, formulário de atividade |
| 10 | Atividades — Backend | `feat/activities-backend` | CRUD de atividades, tipos |
| 11 | Dashboard — UI | `feat/dashboard-ui` | Cards KPI, gráfico Recharts |
| 12 | Dashboard — Backend | `feat/dashboard-backend` | Queries de métricas reais |
| 13 | Workspace & Multi-empresa | `feat/workspace` | UI + Backend juntos (acoplados) |
| 14 | Monetização — UI | `feat/billing-ui` | Página de planos, upgrade banner |
| 15 | Monetização — Backend | `feat/billing-backend` | Stripe, webhooks, guards de plano |
| 16 | Landing Page | `feat/landing` | Página pública completa |
| 17 | Onboarding | `feat/onboarding` | Fluxo guiado pós-cadastro |
| 18 | Polimento & Deploy | `feat/deploy` | Performance, testes, produção |

---

## M1 — Setup & Fundação

**Branch:** `feat/setup`
**Objetivo:** Projeto configurado, design system instalado, TypeScript estrito, estrutura de pastas criada e variáveis de ambiente mapeadas. Base zero para todos os outros milestones.

### Entregas

- [x] Criar projeto Next.js 14 com App Router e TypeScript strict
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=no --import-alias="@/*"
  ```
- [x] Instalar e configurar shadcn/ui (`npx shadcn@latest init`)
- [x] Instalar dependências do projeto:
  ```
  @supabase/supabase-js @supabase/ssr
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  recharts
  resend
  stripe @stripe/stripe-js
  zod
  react-hook-form @hookform/resolvers
  date-fns
  lucide-react
  ```
- [x] Criar estrutura de pastas conforme `CLAUDE.md`
- [x] Criar `.env.local` com todas as variáveis mapeadas (valores vazios)
- [x] Criar `.env.example` para o repositório
- [x] Configurar `lib/utils.ts` com helper `cn()`
- [x] Configurar fonte Inter via `next/font/google` no root layout
- [x] Adicionar tokens de cor do PipeFlow no `globals.css` (Tailwind v4)
- [x] Criar `types/index.ts` com tipos de domínio base (`Lead`, `Deal`, `Activity`, `Workspace`, `Member`)
- [x] Criar `types/database.ts` placeholder (substituído pelo gerado do Supabase depois)
- [x] Configurar `.gitignore` (incluir `.env.local`)
- [x] `git init` + commit inicial

**Commit final:**
```
feat: project setup — Next.js 14, shadcn/ui, Tailwind, TypeScript strict, folder structure
```

---

## M2 — Layout & Navegação (UI)

**Branch:** `feat/layout`
**Objetivo:** Shell completo da aplicação com sidebar, header, navegação entre páginas e páginas placeholder para todas as rotas. App visualmente navegável sem nenhum dado real.

### Entregas

- [x] Criar `app/(app)/layout.tsx` com sidebar + área de conteúdo
- [x] Criar `components/shared/sidebar.tsx`:
  - Logo PipeFlow
  - Links: Dashboard, Leads, Pipeline, Configurações
  - Dropdown de workspace (estático por ora)
  - Avatar do usuário + logout
- [x] Criar `components/shared/header.tsx`:
  - Título da página atual
  - Busca global (input estático)
  - Botão de notificações (placeholder)
- [x] Criar páginas placeholder com título e descrição:
  - `app/(app)/dashboard/page.tsx`
  - `app/(app)/leads/page.tsx`
  - `app/(app)/pipeline/page.tsx`
  - `app/(app)/settings/page.tsx`
- [x] Criar `app/(auth)/layout.tsx` (layout centralizado para auth)
- [x] Criar placeholder `app/(auth)/login/page.tsx`
- [x] Criar placeholder `app/(auth)/register/page.tsx`
- [x] Sidebar responsiva (colapsável em mobile com drawer customizado)
- [x] Estado ativo do link de navegação com `usePathname`

**Commit final:**
```
feat: app shell — sidebar, header, navigation layout, placeholder pages
```

---

## M3 — Auth — UI

**Branch:** `feat/auth-ui`
**Objetivo:** Telas de login e cadastro completas, visualmente polidas, com formulários validados (sem integração real ainda — dados ficam no estado local).

### Entregas

- [ ] `app/(auth)/login/page.tsx` — página completa:
  - Formulário: e-mail + senha
  - Botão "Entrar"
  - Link "Criar conta"
  - Tratamento de erro (estado local)
  - Loading state no botão
- [ ] `app/(auth)/register/page.tsx` — página completa:
  - Formulário: nome + e-mail + senha + confirmar senha
  - Botão "Criar conta"
  - Link "Já tenho conta"
  - Validação com `react-hook-form` + `zod`
- [ ] `app/(auth)/forgot-password/page.tsx`:
  - Formulário de e-mail
  - Mensagem de confirmação pós-envio
- [ ] Componente `components/shared/auth-card.tsx` (wrapper de layout das telas auth)
- [ ] Logo e branding na tela de auth

**Commit final:**
```
feat: auth UI — login, register, forgot-password screens with form validation
```

---

## M4 — Auth — Backend

**Branch:** `feat/auth-backend`
**Objetivo:** Autenticação real com Supabase Auth funcionando — login, cadastro, logout, sessão persistida, rotas protegidas via middleware.

### Entregas

- [ ] Criar projeto no Supabase e copiar credenciais para `.env.local`
- [ ] Criar `lib/supabase/client.ts` — `createBrowserClient`
- [ ] Criar `lib/supabase/server.ts` — `createServerClient` (SSR)
- [ ] Criar `middleware.ts` na raiz — proteger rotas `(app)/*`, redirecionar para `/login`
- [ ] Integrar login com `supabase.auth.signInWithPassword()`
- [ ] Integrar cadastro com `supabase.auth.signUp()`
- [ ] Integrar forgot-password com `supabase.auth.resetPasswordForEmail()`
- [ ] Logout via Server Action em `app/actions/auth.ts`
- [ ] Redirecionar usuário autenticado de `/login` para `/dashboard`
- [ ] Exibir e-mail do usuário logado na sidebar
- [ ] Criar migration inicial: tabela `profiles` (id, full_name, avatar_url, created_at)
- [ ] Trigger Supabase para criar `profile` automaticamente no signup

**Commit final:**
```
feat: auth backend — Supabase Auth, session management, route protection, profiles table
```

---

## M5 — Leads — UI

**Branch:** `feat/leads-ui`
**Objetivo:** Interface completa de gestão de leads com dados mockados — listagem, filtros, página de detalhe e formulário de criação/edição.

### Entregas

- [ ] `app/(app)/leads/page.tsx` — listagem com:
  - Tabela de leads (nome, empresa, cargo, status, responsável, data)
  - Barra de busca (input controlado)
  - Filtros: status, responsável (dropdowns)
  - Botão "Novo Lead"
  - Estado vazio (empty state ilustrado)
  - Loading skeleton
- [ ] `components/leads/lead-table.tsx` — tabela com shadcn `DataTable`
- [ ] `components/leads/lead-filters.tsx` — filtros em linha
- [ ] `components/leads/lead-form.tsx` — formulário modal (Sheet ou Dialog):
  - Campos: nome*, e-mail*, telefone, empresa, cargo, status
  - Validação com zod
  - Modo criação e edição
- [ ] `app/(app)/leads/[id]/page.tsx` — página de detalhe:
  - Card de perfil do lead (todos os campos)
  - Seção "Negócios vinculados" (placeholder)
  - Seção "Atividades" (timeline placeholder)
  - Botão "Editar" + "Arquivar"
- [ ] Badge de status com cores (`components/leads/status-badge.tsx`)
- [ ] Dados mock em `lib/mock-data.ts` para desenvolvimento

**Commit final:**
```
feat: leads UI — list, filters, detail page, create/edit form with mock data
```

---

## M6 — Leads — Backend

**Branch:** `feat/leads-backend`
**Objetivo:** CRUD de leads integrado ao Supabase com RLS por workspace, busca e filtros funcionando com dados reais.

### Entregas

- [ ] Migration: tabela `leads`:
  ```sql
  id, workspace_id, owner_id, name, email, phone,
  company, role, status, created_at, updated_at
  ```
- [ ] RLS: usuário só vê leads do próprio workspace
- [ ] Server Actions em `app/actions/leads.ts`:
  - `createLead(data)` — com validação de limite do plano Free (50 leads)
  - `updateLead(id, data)`
  - `archiveLead(id)`
  - `getLeads(workspaceId, filters)` — com busca e filtros
  - `getLeadById(id)`
- [ ] Substituir mock data nas páginas pelos Server Actions
- [ ] Busca server-side com `ilike` no Supabase
- [ ] Filtros por status e responsável via query params na URL
- [ ] Paginação na listagem (cursor-based ou page-based)
- [ ] Atualização otimista no formulário

**Commit final:**
```
feat: leads backend — Supabase CRUD, RLS, search, filters, plan limit guard
```

---

## M7 — Pipeline — UI

**Branch:** `feat/pipeline-ui`
**Objetivo:** Board Kanban completo e interativo com drag-and-drop, cards de negócios e estado visual por etapa — ainda com dados mockados.

### Entregas

- [ ] `app/(app)/pipeline/page.tsx` — board Kanban
- [ ] `components/pipeline/pipeline-board.tsx` — container DnD com `@dnd-kit`
- [ ] `components/pipeline/pipeline-column.tsx` — coluna por etapa:
  - Header com nome, count e valor total (R$)
  - Área droppable
  - Scroll vertical interno
- [ ] `components/pipeline/deal-card.tsx` — card de negócio:
  - Título do negócio
  - Valor estimado (R$)
  - Nome do lead vinculado
  - Avatar do responsável
  - Data prazo com cor de warning se próxima
  - Draggable handle
- [ ] 6 colunas com cores definidas no `CLAUDE.md`
- [ ] Drag-and-drop entre colunas (sem persistência ainda)
- [ ] Modal de criação de negócio (`components/pipeline/deal-form.tsx`):
  - Título, valor, lead (select), responsável, prazo, etapa inicial
- [ ] Clique no card abre detalhe em Sheet lateral
- [ ] Botão "Novo Negócio" por coluna e global

**Commit final:**
```
feat: pipeline UI — Kanban board, drag-and-drop, deal cards, deal form with mock data
```

---

## M8 — Pipeline — Backend

**Branch:** `feat/pipeline-backend`
**Objetivo:** Pipeline Kanban integrado ao Supabase — negócios persistidos, drag-and-drop salvo no banco, vinculação com leads.

### Entregas

- [ ] Migration: tabela `deals`:
  ```sql
  id, workspace_id, lead_id, owner_id, title, value,
  stage, position, deadline, created_at, updated_at
  ```
- [ ] RLS: usuário só vê negócios do próprio workspace
- [ ] Server Actions em `app/actions/deals.ts`:
  - `createDeal(data)`
  - `updateDeal(id, data)`
  - `moveDeal(id, newStage, newPosition)` — chamado no drop
  - `deleteDeal(id)`
  - `getDealsByWorkspace(workspaceId)`
- [ ] Persistência otimista do drag-and-drop:
  - Atualizar estado local imediatamente
  - Chamar `moveDeal` em background
  - Reverter em caso de erro
- [ ] Carregar negócios reais no board
- [ ] Vinculação com leads via select com busca

**Commit final:**
```
feat: pipeline backend — deals table, RLS, drag-and-drop persistence, lead linking
```

---

## M9 — Atividades — UI

**Branch:** `feat/activities-ui`
**Objetivo:** Timeline de atividades visualmente completa na página de detalhe do lead, com formulário de registro de interações.

### Entregas

- [ ] `components/leads/activity-timeline.tsx` — lista cronológica:
  - Ícone por tipo (ligação 📞, e-mail ✉️, reunião 📅, nota 📝)
  - Autor + data relativa (ex: "há 2 dias")
  - Texto da descrição
  - Separador visual entre dias
- [ ] `components/leads/activity-form.tsx` — formulário inline:
  - Select de tipo
  - Textarea de descrição
  - Date picker de data
  - Botão "Registrar"
- [ ] Integrar timeline na `app/(app)/leads/[id]/page.tsx`
- [ ] Empty state para leads sem atividades
- [ ] Dados mock de atividades em `lib/mock-data.ts`

**Commit final:**
```
feat: activities UI — timeline component, activity form, lead detail integration
```

---

## M10 — Atividades — Backend

**Branch:** `feat/activities-backend`
**Objetivo:** CRUD de atividades integrado ao Supabase, vinculadas ao lead e ao workspace.

### Entregas

- [ ] Migration: tabela `activities`:
  ```sql
  id, workspace_id, lead_id, author_id, type,
  description, occurred_at, created_at
  ```
- [ ] RLS: usuário só vê atividades do próprio workspace
- [ ] Server Actions em `app/actions/activities.ts`:
  - `createActivity(data)`
  - `getActivitiesByLead(leadId)`
  - `deleteActivity(id)`
- [ ] Substituir mock na timeline pelo dados reais
- [ ] Revalidação da página de detalhe após criar atividade

**Commit final:**
```
feat: activities backend — activities table, RLS, CRUD server actions
```

---

## M11 — Dashboard — UI

**Branch:** `feat/dashboard-ui`
**Objetivo:** Dashboard com KPIs visuais e gráfico de funil — dados mockados mas completamente estilizados e responsivos.

### Entregas

- [ ] `app/(app)/dashboard/page.tsx` — layout completo
- [ ] `components/dashboard/kpi-card.tsx` — card reutilizável:
  - Ícone, título, valor principal, variação percentual
  - 4 instâncias: Total Leads, Negócios Abertos, Valor do Pipeline, Taxa de Conversão
- [ ] `components/dashboard/funnel-chart.tsx` — gráfico Recharts:
  - `FunnelChart` ou `BarChart` horizontal por etapa
  - Cores das etapas definidas no `CLAUDE.md`
  - Tooltip com valor e count
- [ ] `components/dashboard/upcoming-deals.tsx` — lista de negócios com prazo próximo:
  - Top 5, ordenado por prazo
  - Badge de urgência (< 3 dias = vermelho, < 7 dias = amarelo)
- [ ] Grid responsivo: 2 cols em tablet, 4 em desktop
- [ ] Dados mock em `lib/mock-data.ts`

**Commit final:**
```
feat: dashboard UI — KPI cards, funnel chart, upcoming deals with mock data
```

---

## M12 — Dashboard — Backend

**Branch:** `feat/dashboard-backend`
**Objetivo:** Dashboard com métricas reais calculadas via queries otimizadas no Supabase.

### Entregas

- [ ] Criar `lib/supabase/queries/dashboard.ts`:
  - `getTotalLeads(workspaceId)` — count de leads ativos
  - `getOpenDeals(workspaceId)` — count excluindo Fechado Ganho/Perdido
  - `getPipelineValue(workspaceId)` — soma de `value` dos negócios abertos
  - `getConversionRate(workspaceId)` — Fechado Ganho / total de negócios
  - `getDealsByStage(workspaceId)` — count e valor por etapa (para funil)
  - `getUpcomingDeals(workspaceId, userId)` — negócios com prazo ≤ 7 dias
- [ ] Dashboard page como async Server Component (sem loading states desnecessários)
- [ ] Suspense boundaries para carregamento progressivo
- [ ] Cache com `revalidate` adequado (30s para métricas)

**Commit final:**
```
feat: dashboard backend — real metrics queries, Supabase aggregations, Suspense
```

---

## M13 — Workspace & Multi-empresa

**Branch:** `feat/workspace`
**Objetivo:** Sistema multi-empresa completo — criação de workspace, convite por e-mail, papéis Admin/Membro, alternância, RLS em todas as tabelas.

> Este milestone integra UI e backend simultaneamente pois são fortemente acoplados.

### Entregas

**Banco de dados**
- [ ] Migration: tabela `workspaces`:
  ```sql
  id, name, slug, plan, stripe_customer_id,
  stripe_subscription_id, created_at
  ```
- [ ] Migration: tabela `workspace_members`:
  ```sql
  id, workspace_id, user_id, role (admin|member),
  invited_email, status (active|pending), created_at
  ```
- [ ] Atualizar RLS de todas as tabelas para filtrar por `workspace_id`
- [ ] Middleware: injetar `workspace_id` ativo na sessão

**UI**
- [ ] `app/(app)/settings/workspace/page.tsx`:
  - Nome do workspace (editável)
  - Lista de membros com papel e status
  - Input de convite por e-mail
  - Botão de remover membro (Admin only)
- [ ] Dropdown de workspace na sidebar:
  - Lista de workspaces do usuário
  - Botão "Criar novo workspace"
  - Workspace ativo com checkmark
- [ ] `app/(app)/settings/workspace/create/page.tsx`:
  - Formulário: nome do workspace
  - Redireciona para onboarding após criar

**Backend**
- [ ] Server Actions em `app/actions/workspace.ts`:
  - `createWorkspace(name)`
  - `inviteMember(email, workspaceId, role)` — envia e-mail via Resend
  - `acceptInvite(token)` — rota pública `app/invite/[token]/page.tsx`
  - `removeMember(memberId)`
  - `updateMemberRole(memberId, role)`
  - `switchWorkspace(workspaceId)` — atualiza cookie de workspace ativo
- [ ] Template de e-mail de convite em `emails/invite.tsx` (React Email)
- [ ] Guard: Admin pode convidar; Membro não pode

**Commit final:**
```
feat: workspace — multi-company, invites via Resend, roles, RLS on all tables
```

---

## M14 — Monetização — UI

**Branch:** `feat/billing-ui`
**Objetivo:** Interface de planos e assinatura — página de preços interna, banner de upgrade para usuários Free, indicadores de limite.

### Entregas

- [ ] `app/(app)/settings/billing/page.tsx`:
  - Plano atual com status
  - Botão "Fazer upgrade para Pro" (Free) ou "Gerenciar assinatura" (Pro)
  - Detalhes do plano: colaboradores usados / limite, leads usados / limite
- [ ] `components/shared/upgrade-banner.tsx`:
  - Banner sutil no topo quando Free e próximo do limite
  - "Você usou X de 50 leads. Faça upgrade para ilimitado."
- [ ] `components/shared/plan-guard.tsx`:
  - Wrapper que exibe overlay de bloqueio ao atingir limite
  - CTA para upgrade
- [ ] Indicadores de uso na sidebar (barra de progresso de leads)
- [ ] Página de sucesso após checkout: `app/billing/success/page.tsx`
- [ ] Página de cancelamento: `app/billing/cancel/page.tsx`

**Commit final:**
```
feat: billing UI — plan page, upgrade banner, usage indicators, plan guard
```

---

## M15 — Monetização — Backend

**Branch:** `feat/billing-backend`
**Objetivo:** Stripe integrado end-to-end — checkout, webhooks, ativação/desativação de plano, Customer Portal, guards server-side.

### Entregas

- [ ] Configurar produto e preço no Stripe Dashboard (R$49/mês)
- [ ] Criar `lib/stripe.ts` com cliente Stripe configurado
- [ ] Route Handler `app/api/stripe/checkout/route.ts`:
  - Criar `checkout.session` com `mode: "subscription"`
  - Parâmetros: `workspaceId`, `priceId`, `successUrl`, `cancelUrl`
- [ ] Route Handler `app/api/stripe/portal/route.ts`:
  - Criar sessão do Customer Portal
- [ ] Supabase Edge Function `supabase/functions/stripe-webhook/index.ts`:
  - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
  - Atualizar `workspaces.plan`, `stripe_customer_id`, `stripe_subscription_id`
- [ ] Guards server-side nos Server Actions:
  - `createLead` — verificar limite de 50 (Free)
  - `inviteMember` — verificar limite de 2 colaboradores (Free)
- [ ] Testar fluxo completo com Stripe CLI (`stripe listen`)

**Commit final:**
```
feat: billing backend — Stripe checkout, webhooks, Edge Function, plan guards
```

---

## M16 — Landing Page

**Branch:** `feat/landing`
**Objetivo:** Página pública de apresentação do PipeFlow CRM, otimizada para conversão, com todas as seções e link para cadastro.

### Entregas

- [ ] `app/(marketing)/layout.tsx` — layout com navbar e footer
- [ ] `app/(marketing)/page.tsx` — landing page
- [ ] `components/marketing/navbar.tsx`:
  - Logo, links âncora (Funcionalidades, Preços), botões "Login" e "Começar grátis"
  - Sticky no scroll
- [ ] `components/marketing/hero.tsx`:
  - Headline + subtítulo
  - CTA duplo: "Começar grátis" + "Ver demo"
  - Screenshot/mockup do pipeline
- [ ] `components/marketing/features.tsx`:
  - Grid de 6 cards: Pipeline Kanban, Gestão de Leads, Dashboard, Multi-empresa, Atividades, Integrações
  - Ícone + título + descrição curta
- [ ] `components/marketing/pricing.tsx`:
  - 2 cards: Free e Pro (R$49/mês)
  - Lista de features por plano
  - CTA "Começar grátis" e "Assinar Pro"
  - Destaque no plano Pro
- [ ] `components/marketing/footer.tsx`:
  - Logo, links, copyright
- [ ] Meta tags OG para compartilhamento social
- [ ] `app/sitemap.ts` e `app/robots.ts`

**Commit final:**
```
feat: landing page — hero, features, pricing, navbar, footer, SEO meta tags
```

---

## M17 — Onboarding

**Branch:** `feat/onboarding`
**Objetivo:** Fluxo guiado que orienta o usuário recém-cadastrado a criar workspace, convidar time e cadastrar o primeiro lead.

### Entregas

- [ ] `app/(app)/onboarding/page.tsx` — stepper de 3 etapas:
  - Step 1: Nome do workspace (com slug gerado automaticamente)
  - Step 2: Convidar colaboradores (até 2 e-mails, opcional)
  - Step 3: Criar primeiro lead (campos essenciais)
- [ ] `components/onboarding/onboarding-stepper.tsx` — barra de progresso visual
- [ ] Redirecionar para `/onboarding` após primeiro login (verificar se `profile.onboarded = false`)
- [ ] Marcar `profile.onboarded = true` ao concluir
- [ ] Botão "Pular por agora" em cada etapa opcional
- [ ] Redirecionar para `/dashboard` ao finalizar

**Commit final:**
```
feat: onboarding — guided 3-step flow, workspace + invite + first lead setup
```

---

## M18 — Polimento & Deploy

**Branch:** `feat/deploy`
**Objetivo:** App em produção no Vercel + Supabase, com performance validada, erros tratados e configurações de produção aplicadas.

### Entregas

**Qualidade & UX**
- [ ] Revisar todos os empty states (todas as páginas com lista)
- [ ] Revisar todos os loading states e skeletons
- [ ] Tratamento global de erros: `app/error.tsx` e `app/not-found.tsx`
- [ ] Toast notifications consistentes (shadcn `Sonner`) em todas as ações
- [ ] Confirmar dialogs antes de ações destrutivas (deletar lead, remover membro)
- [ ] Verificar responsividade em mobile (375px, 768px, 1280px)

**Performance**
- [ ] Adicionar `loading.tsx` em todas as rotas do `(app)/`
- [ ] Revisar uso de `revalidatePath` vs `revalidateTag` nos Server Actions
- [ ] Lazy load do `FunnelChart` (Recharts é pesado — `dynamic(() => import(...)`)
- [ ] Imagens otimizadas com `next/image`

**Segurança**
- [ ] Verificar que nenhuma chave secreta está exposta no client
- [ ] Validar todos os inputs com Zod nos Server Actions
- [ ] Confirmar que RLS está ativo em todas as tabelas do Supabase
- [ ] Webhook do Stripe com verificação de assinatura (`stripe.webhooks.constructEvent`)

**Deploy**
- [ ] Criar projeto no Vercel e vincular ao repositório GitHub
- [ ] Configurar variáveis de ambiente no Vercel (todas as do `.env.local`)
- [ ] Deploy do Supabase Edge Function (`supabase functions deploy stripe-webhook`)
- [ ] Configurar webhook URL no Stripe Dashboard (apontando para Edge Function)
- [ ] Testar fluxo completo em produção:
  - Cadastro → onboarding → criar lead → mover pipeline → upgrade → Customer Portal
- [ ] Configurar domínio customizado (opcional)

**Commit final:**
```
feat: production deploy — error handling, performance, security hardening, Vercel + Supabase
```

---

## Regras de Trabalho

1. **Uma branch por milestone** — nunca desenvolver dois milestones na mesma branch
2. **Testar antes de avançar** — validar o happy path e um edge case antes do commit final
3. **Mock data separado** — manter em `lib/mock-data.ts`, remover ao integrar o backend
4. **Commits semânticos** — prefixo `feat:`, `fix:`, `chore:`, `docs:`
5. **Tipos primeiro** — atualizar `types/index.ts` antes de implementar qualquer feature nova
6. **RLS sempre** — toda nova tabela precisa de políticas RLS antes de qualquer query do frontend
