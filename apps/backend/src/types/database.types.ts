// Supabase Database Types
// Enhanced type definitions for Supabase tables

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          password_hash: string;
          role: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
          organization_id: string | null;
          email_verified_at: string | null;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          password_hash: string;
          role?: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
          organization_id?: string | null;
          email_verified_at?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          [key: string]: any;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          password_hash?: string;
          role?: 'BENEFICIARY' | 'CONSULTANT' | 'ORG_ADMIN';
          organization_id?: string | null;
          email_verified_at?: string | null;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          [key: string]: any;
        };
      };
      bilans: {
        Row: {
          id: string;
          beneficiary_id: string;
          consultant_id: string | null;
          organization_id: string | null;
          status: 'PRELIMINARY' | 'INVESTIGATION' | 'CONCLUSION' | 'COMPLETED' | 'ARCHIVED';
          start_date: string;
          expected_end_date: string | null;
          actual_end_date: string | null;
          duration_hours: number | null;
          satisfaction_score: number | null;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          beneficiary_id: string;
          consultant_id?: string | null;
          organization_id?: string | null;
          status?: string;
          start_date?: string;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          duration_hours?: number | null;
          satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          beneficiary_id?: string;
          consultant_id?: string | null;
          organization_id?: string | null;
          status?: string;
          start_date?: string;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          duration_hours?: number | null;
          satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      recommendations: {
        Row: {
          id: string;
          bilan_id: string;
          type: string;
          title: string;
          description: string | null;
          match_score: number | null;
          priority: number;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          bilan_id: string;
          type: string;
          title: string;
          description?: string | null;
          match_score?: number | null;
          priority?: number;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          bilan_id?: string;
          type?: string;
          title?: string;
          description?: string | null;
          match_score?: number | null;
          priority?: number;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          changes: any | null;
          ip_address: string | null;
          created_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          changes?: any | null;
          ip_address?: string | null;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          changes?: any | null;
          ip_address?: string | null;
          created_at?: string;
          [key: string]: any;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          refresh_token: string;
          is_active: boolean;
          expires_at: string;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          refresh_token: string;
          is_active?: boolean;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          refresh_token?: string;
          is_active?: boolean;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      password_reset_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          used: boolean;
          used_at: string | null;
          expires_at: string;
          created_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          used?: boolean;
          used_at?: string | null;
          expires_at: string;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          used?: boolean;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string;
          [key: string]: any;
        };
      };
      email_verification_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          used: boolean;
          used_at: string | null;
          expires_at: string;
          created_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          used?: boolean;
          used_at?: string | null;
          expires_at: string;
          created_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          used?: boolean;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string;
          [key: string]: any;
        };
      };
      assessments: {
        Row: {
          id: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          [key: string]: any;
        };
      };
      assessment_questions: {
        Row: {
          id: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          [key: string]: any;
        };
      };
      assessment_answers: {
        Row: {
          id: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          [key: string]: any;
        };
      };
      messages: {
        Row: {
          id: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          [key: string]: any;
        };
      };
      files: {
        Row: {
          id: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          [key: string]: any;
        };
      };
      notifications: {
        Row: {
          id: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          [key: string]: any;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          admin_user_id: string;
          description?: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          name: string;
          admin_user_id: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          name?: string;
          admin_user_id?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      [key: string]: any;
    };
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
  };
};
