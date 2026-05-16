import type { Workspace, Profile } from "@/types";

export const MOCK_WORKSPACES: Workspace[] = [
  {
    id: "ws-1",
    name: "Acme Corp",
    slug: "acme-corp",
    plan: "pro",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "ws-2",
    name: "Startup XYZ",
    slug: "startup-xyz",
    plan: "free",
    createdAt: "2024-03-20T10:00:00Z",
  },
  {
    id: "ws-3",
    name: "Projetos Freelance",
    slug: "freelance",
    plan: "free",
    createdAt: "2024-06-01T10:00:00Z",
  },
];

export const MOCK_ACTIVE_WORKSPACE = MOCK_WORKSPACES[0];

export const MOCK_USER: Profile = {
  id: "user-1",
  fullName: "Pedro Alves",
  avatarUrl: undefined,
  onboarded: true,
  createdAt: "2024-01-15T10:00:00Z",
};

export const MOCK_USER_EMAIL = "pedro@acme.com";
