// Gerado manualmente a partir das migrations do PipeFlow CRM.
// Substitua pelo output de `npx supabase gen types typescript --local`
// após conectar o Supabase CLI ao projeto.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Enums ──────────────────────────────────────────────────────

export type WorkspacePlan     = 'free' | 'pro' | 'payment_failed';
export type MemberRole        = 'admin' | 'member';
export type MemberStatus      = 'active' | 'pending';
export type LeadStatus        = 'novo' | 'contato_realizado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido' | 'arquivado';
export type DealStage         = 'novo_lead' | 'contato_realizado' | 'proposta_enviada' | 'negociacao' | 'fechado_ganho' | 'fechado_perdido';
export type ActivityType      = 'ligacao' | 'email' | 'reuniao' | 'nota';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';

// ── Database interface (padrão Supabase — Relationships obrigatório no v2) ──

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id:         string;
          full_name:  string | null;
          avatar_url: string | null;
          onboarded:  boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id:         string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarded?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?:        string;
          full_name?: string | null;
          avatar_url?: string | null;
          onboarded?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      workspaces: {
        Row: {
          id:                     string;
          name:                   string;
          slug:                   string;
          plan:                   WorkspacePlan;
          stripe_customer_id:     string | null;
          stripe_subscription_id: string | null;
          created_at:             string;
          updated_at:             string;
        };
        Insert: {
          id?:                    string;
          name:                   string;
          slug:                   string;
          plan?:                  WorkspacePlan;
          stripe_customer_id?:    string | null;
          stripe_subscription_id?: string | null;
          created_at?:            string;
          updated_at?:            string;
        };
        Update: {
          id?:                    string;
          name?:                  string;
          slug?:                  string;
          plan?:                  WorkspacePlan;
          stripe_customer_id?:    string | null;
          stripe_subscription_id?: string | null;
          updated_at?:            string;
        };
        Relationships: [];
      };

      workspace_members: {
        Row: {
          id:            string;
          workspace_id:  string;
          user_id:       string | null;
          role:          MemberRole;
          invited_email: string | null;
          status:        MemberStatus;
          created_at:    string;
        };
        Insert: {
          id?:           string;
          workspace_id:  string;
          user_id?:      string | null;
          role?:         MemberRole;
          invited_email?: string | null;
          status?:       MemberStatus;
          created_at?:   string;
        };
        Update: {
          id?:           string;
          workspace_id?: string;
          user_id?:      string | null;
          role?:         MemberRole;
          invited_email?: string | null;
          status?:       MemberStatus;
        };
        Relationships: [];
      };

      leads: {
        Row: {
          id:           string;
          workspace_id: string;
          owner_id:     string | null;
          name:         string;
          email:        string | null;
          phone:        string | null;
          company:      string | null;
          role:         string | null;
          status:       LeadStatus;
          notes:        string | null;
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id?:          string;
          workspace_id: string;
          owner_id?:    string | null;
          name:         string;
          email?:       string | null;
          phone?:       string | null;
          company?:     string | null;
          role?:        string | null;
          status?:      LeadStatus;
          notes?:       string | null;
          created_at?:  string;
          updated_at?:  string;
        };
        Update: {
          id?:          string;
          workspace_id?: string;
          owner_id?:    string | null;
          name?:        string;
          email?:       string | null;
          phone?:       string | null;
          company?:     string | null;
          role?:        string | null;
          status?:      LeadStatus;
          notes?:       string | null;
          updated_at?:  string;
        };
        Relationships: [];
      };

      deals: {
        Row: {
          id:           string;
          workspace_id: string;
          lead_id:      string | null;
          owner_id:     string | null;
          title:        string;
          value:        number;
          stage:        DealStage;
          position:     number;
          deadline:     string | null;
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id?:          string;
          workspace_id: string;
          lead_id?:     string | null;
          owner_id?:    string | null;
          title:        string;
          value?:       number;
          stage?:       DealStage;
          position?:    number;
          deadline?:    string | null;
          created_at?:  string;
          updated_at?:  string;
        };
        Update: {
          id?:          string;
          workspace_id?: string;
          lead_id?:     string | null;
          owner_id?:    string | null;
          title?:       string;
          value?:       number;
          stage?:       DealStage;
          position?:    number;
          deadline?:    string | null;
          updated_at?:  string;
        };
        Relationships: [
          {
            foreignKeyName: "deals_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          }
        ];
      };

      activities: {
        Row: {
          id:           string;
          workspace_id: string;
          lead_id:      string;
          author_id:    string | null;
          type:         ActivityType;
          description:  string;
          occurred_at:  string;
          created_at:   string;
        };
        Insert: {
          id?:          string;
          workspace_id: string;
          lead_id:      string;
          author_id?:   string | null;
          type:         ActivityType;
          description:  string;
          occurred_at?: string;
          created_at?:  string;
        };
        Update: {
          id?:          string;
          workspace_id?: string;
          lead_id?:     string;
          author_id?:   string | null;
          type?:        ActivityType;
          description?: string;
          occurred_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          }
        ];
      };

      workspace_invites: {
        Row: {
          id:           string;
          workspace_id: string;
          invited_by:   string;
          email:        string;
          role:         MemberRole;
          token:        string;
          expires_at:   string;
          accepted_at:  string | null;
          created_at:   string;
        };
        Insert: {
          id?:          string;
          workspace_id: string;
          invited_by:   string;
          email:        string;
          role?:        MemberRole;
          token?:       string;
          expires_at?:  string;
          accepted_at?: string | null;
          created_at?:  string;
        };
        Update: {
          accepted_at?: string | null;
        };
        Relationships: [];
      };

      subscriptions: {
        Row: {
          id:                     string;
          workspace_id:           string;
          stripe_subscription_id: string;
          stripe_customer_id:     string;
          stripe_price_id:        string;
          status:                 SubscriptionStatus;
          current_period_start:   string;
          current_period_end:     string;
          cancel_at_period_end:   boolean;
          canceled_at:            string | null;
          created_at:             string;
          updated_at:             string;
        };
        Insert: {
          id?:                    string;
          workspace_id:           string;
          stripe_subscription_id: string;
          stripe_customer_id:     string;
          stripe_price_id:        string;
          status:                 SubscriptionStatus;
          current_period_start:   string;
          current_period_end:     string;
          cancel_at_period_end?:  boolean;
          canceled_at?:           string | null;
          created_at?:            string;
          updated_at?:            string;
        };
        Update: {
          id?:                    string;
          workspace_id?:          string;
          stripe_subscription_id?: string;
          stripe_customer_id?:    string;
          stripe_price_id?:       string;
          status?:                SubscriptionStatus;
          current_period_start?:  string;
          current_period_end?:    string;
          cancel_at_period_end?:  boolean;
          canceled_at?:           string | null;
          updated_at?:            string;
        };
        Relationships: [];
      };
    };

    Views: Record<string, never>;

    Functions: {
      my_workspace_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
      accept_workspace_invite: {
        Args: { p_token: string };
        Returns: Json;
      };
    };

    Enums: {
      workspace_plan:      WorkspacePlan;
      member_role:         MemberRole;
      member_status:       MemberStatus;
      lead_status:         LeadStatus;
      deal_stage:          DealStage;
      activity_type:       ActivityType;
      subscription_status: SubscriptionStatus;
    };
  };
}

// ── Tipos de conveniência (Row aliases) ───────────────────────

export type ProfileRow           = Database['public']['Tables']['profiles']['Row'];
export type WorkspaceRow         = Database['public']['Tables']['workspaces']['Row'];
export type WorkspaceMemberRow   = Database['public']['Tables']['workspace_members']['Row'];
export type WorkspaceInviteRow   = Database['public']['Tables']['workspace_invites']['Row'];
export type LeadRow              = Database['public']['Tables']['leads']['Row'];
export type DealRow              = Database['public']['Tables']['deals']['Row'];
export type ActivityRow          = Database['public']['Tables']['activities']['Row'];
export type SubscriptionRow      = Database['public']['Tables']['subscriptions']['Row'];
