export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accelerator_applications: {
        Row: {
          batch: string | null
          business_model: string | null
          cofounder_details: Json | null
          cohort_id: string | null
          company_description: string | null
          company_location: string | null
          company_name: string | null
          company_registered: boolean | null
          company_url: string | null
          competitors: string | null
          created_at: string
          current_progress: string | null
          current_valuation: string | null
          differentiation: string | null
          edit_count: number
          equity_raised: string | null
          founding_date: string | null
          id: string
          logo_url: string | null
          previous_funding: string | null
          problem_statement: string | null
          registration_status: string | null
          solution: string | null
          status: Database["public"]["Enums"]["application_status"]
          submitted_at: string | null
          tech_stack: string | null
          traction_metrics: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          batch?: string | null
          business_model?: string | null
          cofounder_details?: Json | null
          cohort_id?: string | null
          company_description?: string | null
          company_location?: string | null
          company_name?: string | null
          company_registered?: boolean | null
          company_url?: string | null
          competitors?: string | null
          created_at?: string
          current_progress?: string | null
          current_valuation?: string | null
          differentiation?: string | null
          edit_count?: number
          equity_raised?: string | null
          founding_date?: string | null
          id?: string
          logo_url?: string | null
          previous_funding?: string | null
          problem_statement?: string | null
          registration_status?: string | null
          solution?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          tech_stack?: string | null
          traction_metrics?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          batch?: string | null
          business_model?: string | null
          cofounder_details?: Json | null
          cohort_id?: string | null
          company_description?: string | null
          company_location?: string | null
          company_name?: string | null
          company_registered?: boolean | null
          company_url?: string | null
          competitors?: string | null
          created_at?: string
          current_progress?: string | null
          current_valuation?: string | null
          differentiation?: string | null
          edit_count?: number
          equity_raised?: string | null
          founding_date?: string | null
          id?: string
          logo_url?: string | null
          previous_funding?: string | null
          problem_statement?: string | null
          registration_status?: string | null
          solution?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          submitted_at?: string | null
          tech_stack?: string | null
          traction_metrics?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accelerator_applications_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accelerator_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      application_collaborators: {
        Row: {
          application_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_collaborators_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "accelerator_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cofounder_invites: {
        Row: {
          application_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          name: string | null
          role: string | null
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          name?: string | null
          role?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          name?: string | null
          role?: string | null
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cofounder_invites_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "accelerator_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cofounder_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cohorts: {
        Row: {
          code: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          is_active: boolean
          late_deadline: string | null
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          late_deadline?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          late_deadline?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          company_name: string
          consent: boolean
          created_at: string
          current_crm: string | null
          email: string
          estimated_lead_volume: string | null
          full_name: string
          id: string
          industry: string
          key_pain_point: string
          phone: string
          pilot_path: string
          preferred_time: string | null
        }
        Insert: {
          company_name: string
          consent?: boolean
          created_at?: string
          current_crm?: string | null
          email: string
          estimated_lead_volume?: string | null
          full_name: string
          id?: string
          industry: string
          key_pain_point: string
          phone: string
          pilot_path: string
          preferred_time?: string | null
        }
        Update: {
          company_name?: string
          consent?: boolean
          created_at?: string
          current_crm?: string | null
          email?: string
          estimated_lead_volume?: string | null
          full_name?: string
          id?: string
          industry?: string
          key_pain_point?: string
          phone?: string
          pilot_path?: string
          preferred_time?: string | null
        }
        Relationships: []
      }
      enterprise_leads: {
        Row: {
          additional_notes: string | null
          best_time_for_demo: string | null
          company_name: string
          contact_name: string
          created_at: string
          deployment_mode: string | null
          email: string
          estimated_scale: string | null
          id: string
          industry: string
          nda_accepted: boolean
          phone: string | null
          role: string | null
          use_cases: string[]
        }
        Insert: {
          additional_notes?: string | null
          best_time_for_demo?: string | null
          company_name: string
          contact_name: string
          created_at?: string
          deployment_mode?: string | null
          email: string
          estimated_scale?: string | null
          id?: string
          industry: string
          nda_accepted?: boolean
          phone?: string | null
          role?: string | null
          use_cases: string[]
        }
        Update: {
          additional_notes?: string | null
          best_time_for_demo?: string | null
          company_name?: string
          contact_name?: string
          created_at?: string
          deployment_mode?: string | null
          email?: string
          estimated_scale?: string | null
          id?: string
          industry?: string
          nda_accepted?: boolean
          phone?: string | null
          role?: string | null
          use_cases?: string[]
        }
        Relationships: []
      }
      investor_leads: {
        Row: {
          best_time_to_contact: string | null
          comments: string | null
          company_name: string | null
          consent: boolean
          created_at: string
          email: string
          estimated_budget: string | null
          id: string
          interest_types: string[]
          name: string
          phone: string | null
          preferred_followup: string | null
          role: string | null
        }
        Insert: {
          best_time_to_contact?: string | null
          comments?: string | null
          company_name?: string | null
          consent?: boolean
          created_at?: string
          email: string
          estimated_budget?: string | null
          id?: string
          interest_types: string[]
          name: string
          phone?: string | null
          preferred_followup?: string | null
          role?: string | null
        }
        Update: {
          best_time_to_contact?: string | null
          comments?: string | null
          company_name?: string | null
          consent?: boolean
          created_at?: string
          email?: string
          estimated_budget?: string | null
          id?: string
          interest_types?: string[]
          name?: string
          phone?: string | null
          preferred_followup?: string | null
          role?: string | null
        }
        Relationships: []
      }
      lead_submissions: {
        Row: {
          ai_calling_consent: boolean
          country_code: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          mobile: string | null
          name: string | null
          source: string
          use_case: string | null
        }
        Insert: {
          ai_calling_consent?: boolean
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          mobile?: string | null
          name?: string | null
          source: string
          use_case?: string | null
        }
        Update: {
          ai_calling_consent?: boolean
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          mobile?: string | null
          name?: string | null
          source?: string
          use_case?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          country_code: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          country_code?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      voice_leads: {
        Row: {
          comments: string | null
          company_name: string
          consent: boolean
          created_at: string
          current_solution: string | null
          email: string
          estimated_call_volume: string | null
          full_name: string
          id: string
          industry: string
          phone: string
          use_case: string | null
        }
        Insert: {
          comments?: string | null
          company_name: string
          consent?: boolean
          created_at?: string
          current_solution?: string | null
          email: string
          estimated_call_volume?: string | null
          full_name: string
          id?: string
          industry: string
          phone: string
          use_case?: string | null
        }
        Update: {
          comments?: string | null
          company_name?: string
          consent?: boolean
          created_at?: string
          current_solution?: string | null
          email?: string
          estimated_call_volume?: string | null
          full_name?: string
          id?: string
          industry?: string
          phone?: string
          use_case?: string | null
        }
        Relationships: []
      }
      voice_widget_calls: {
        Row: {
          country_code: string
          created_at: string | null
          full_phone: string
          id: string
          name: string
          page_url: string | null
          phone: string
          source: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          full_phone: string
          id?: string
          name: string
          page_url?: string | null
          phone: string
          source?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          full_phone?: string
          id?: string
          name?: string
          page_url?: string | null
          phone?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "accepted"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "accepted",
        "rejected",
      ],
    },
  },
} as const
