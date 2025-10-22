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
          beneficiary_id: string;
          consultant_id: string | null;
          organization_id: string | null;
          title: string;
          description?: string | null;
          assessment_type: 'career' | 'skills' | 'comprehensive';
          status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED';
          current_step: number; // 0-5
          progress_percentage: number; // 0-100
          started_at: string | null;
          submitted_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          beneficiary_id: string;
          consultant_id?: string | null;
          organization_id?: string | null;
          title: string;
          description?: string | null;
          assessment_type?: 'career' | 'skills' | 'comprehensive';
          status?: string;
          current_step?: number;
          progress_percentage?: number;
          started_at?: string | null;
          submitted_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          beneficiary_id?: string;
          consultant_id?: string | null;
          organization_id?: string | null;
          title?: string;
          description?: string | null;
          assessment_type?: string;
          status?: string;
          current_step?: number;
          progress_percentage?: number;
          started_at?: string | null;
          submitted_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      assessment_questions: {
        Row: {
          id: string;
          assessment_id: string | null;
          step_number: number;
          section: 'work_history' | 'education' | 'skills' | 'motivations' | 'constraints';
          question_text: string;
          question_type: 'text' | 'textarea' | 'select' | 'multiselect' | 'rating' | 'checkbox_array' | 'date' | 'email' | 'open_ended';
          options?: any[] | null;
          order: number;
          required: boolean;
          help_text?: string | null;
          placeholder?: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          assessment_id?: string | null;
          step_number: number;
          section: string;
          question_text: string;
          question_type: string;
          options?: any[] | null;
          order?: number;
          required?: boolean;
          help_text?: string | null;
          placeholder?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          assessment_id?: string | null;
          step_number?: number;
          section?: string;
          question_text?: string;
          question_type?: string;
          options?: any[] | null;
          order?: number;
          required?: boolean;
          help_text?: string | null;
          placeholder?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      assessment_answers: {
        Row: {
          id: string;
          assessment_id: string;
          question_id: string;
          step_number: number;
          section: 'work_history' | 'education' | 'skills' | 'motivations' | 'constraints';
          answer_value: any;
          answer_type: string;
          submitted_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          question_id: string;
          step_number?: number;
          section?: string;
          answer_value: any;
          answer_type?: string;
          submitted_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          question_id?: string;
          step_number?: number;
          section?: string;
          answer_value?: any;
          answer_type?: string;
          submitted_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      assessment_competencies: {
        Row: {
          id: string;
          assessment_id: string;
          skill_name: string;
          category: 'technical' | 'soft' | 'language' | 'other';
          self_assessment_level: number; // 1-4
          self_interest_level: number; // 1-10
          context?: string | null;
          consultant_assessment_level?: number | null;
          consultant_notes?: string | null;
          validated_at?: string | null;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          skill_name: string;
          category: string;
          self_assessment_level?: number;
          self_interest_level?: number;
          context?: string | null;
          consultant_assessment_level?: number | null;
          consultant_notes?: string | null;
          validated_at?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          skill_name?: string;
          category?: string;
          self_assessment_level?: number;
          self_interest_level?: number;
          context?: string | null;
          consultant_assessment_level?: number | null;
          consultant_notes?: string | null;
          validated_at?: string | null;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
      };
      assessment_drafts: {
        Row: {
          id: string;
          assessment_id: string;
          current_step_number: number;
          draft_data: any; // JSONB
          auto_save_enabled: boolean;
          last_saved_at: string;
          created_at: string;
          updated_at: string;
          [key: string]: any;
        };
        Insert: {
          id?: string;
          assessment_id: string;
          current_step_number?: number;
          draft_data?: any;
          auto_save_enabled?: boolean;
          last_saved_at?: string;
          created_at?: string;
          updated_at?: string;
          [key: string]: any;
        };
        Update: {
          id?: string;
          assessment_id?: string;
          current_step_number?: number;
          draft_data?: any;
          auto_save_enabled?: boolean;
          last_saved_at?: string;
          created_at?: string;
          updated_at?: string;
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
