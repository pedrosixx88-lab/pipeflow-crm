// types/supabase.ts
// Tipos derivados do schema do Supabase — prontos para uso nos componentes e server actions.

export type { Database } from './database';

export type {
  // Enums
  WorkspacePlan,
  MemberRole,
  MemberStatus,
  LeadStatus,
  DealStage,
  ActivityType,
  SubscriptionStatus,
  // Row aliases
  ProfileRow,
  WorkspaceRow,
  WorkspaceMemberRow,
  LeadRow,
  DealRow,
  ActivityRow,
  SubscriptionRow,
} from './database';

// ── Tipos compostos para uso no frontend ─────────────────────

import type { WorkspaceRow, WorkspaceMemberRow, ProfileRow, LeadRow, DealRow } from './database';

/** Workspace com o plano já resolvido e lista de membros */
export interface WorkspaceWithMembers extends WorkspaceRow {
  members: WorkspaceMemberRow[];
}

/** Membro com o perfil do usuário resolvido via join */
export interface MemberWithProfile extends WorkspaceMemberRow {
  profile: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null;
}

/** Lead com o owner resolvido */
export interface LeadWithOwner extends LeadRow {
  owner: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null;
}

/** Deal com lead e owner resolvidos */
export interface DealWithLead extends DealRow {
  lead:  Pick<LeadRow, 'name' | 'company'> | null;
  owner: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null;
}

/** Contexto de workspace ativo (armazenado no cookie/sessão) */
export interface ActiveWorkspaceContext {
  workspaceId: string;
  role: 'admin' | 'member';
}
