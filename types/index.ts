export type LeadStatus =
  | "novo"
  | "contato_realizado"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export type DealStage =
  | "novo_lead"
  | "contato_realizado"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export type ActivityType = "ligacao" | "email" | "reuniao" | "nota";

export type WorkspacePlan = "free" | "pro";

export type MemberRole = "admin" | "member";

export type MemberStatus = "active" | "pending";

export interface Lead {
  id: string;
  workspaceId: string;
  ownerId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  workspaceId: string;
  leadId: string;
  ownerId: string;
  title: string;
  value: number;
  stage: DealStage;
  position: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  workspaceId: string;
  leadId: string;
  authorId: string;
  type: ActivityType;
  description: string;
  occurredAt: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  invitedEmail?: string;
  status: MemberStatus;
  createdAt: string;
}

export interface Profile {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  onboarded: boolean;
  createdAt: string;
}

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  invitedBy: string;
  email: string;
  role: MemberRole;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

// Membro enriquecido com dados do perfil (usado na UI de membros)
export interface MemberWithProfile extends Member {
  profile?: {
    fullName?: string;
    avatarUrl?: string;
    email?: string;
  };
}
