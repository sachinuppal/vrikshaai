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
      crm_allied_industries: {
        Row: {
          action_template: Json | null
          allied_industry_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          primary_industry_id: string
          relationship_strength: number | null
          relationship_type: string | null
          trigger_conditions: Json | null
          trigger_stage: string | null
        }
        Insert: {
          action_template?: Json | null
          allied_industry_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          primary_industry_id: string
          relationship_strength?: number | null
          relationship_type?: string | null
          trigger_conditions?: Json | null
          trigger_stage?: string | null
        }
        Update: {
          action_template?: Json | null
          allied_industry_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          primary_industry_id?: string
          relationship_strength?: number | null
          relationship_type?: string | null
          trigger_conditions?: Json | null
          trigger_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_allied_industries_allied_industry_id_fkey"
            columns: ["allied_industry_id"]
            isOneToOne: false
            referencedRelation: "crm_industry_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_allied_industries_primary_industry_id_fkey"
            columns: ["primary_industry_id"]
            isOneToOne: false
            referencedRelation: "crm_industry_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          base_profile: Json | null
          churn_risk: number | null
          company_name: string | null
          country_code: string | null
          created_at: string | null
          email: string | null
          engagement_score: number | null
          full_name: string | null
          id: string
          intent_score: number | null
          last_channel: string | null
          last_interaction_at: string | null
          lifecycle_stage: string | null
          ltv_prediction: number | null
          optimal_contact_time: string | null
          phone: string | null
          preferred_channel: string | null
          primary_industry: string | null
          source: string | null
          source_id: string | null
          tags: string[] | null
          total_interactions: number | null
          updated_at: string | null
          urgency_score: number | null
          user_type: string | null
        }
        Insert: {
          base_profile?: Json | null
          churn_risk?: number | null
          company_name?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          full_name?: string | null
          id?: string
          intent_score?: number | null
          last_channel?: string | null
          last_interaction_at?: string | null
          lifecycle_stage?: string | null
          ltv_prediction?: number | null
          optimal_contact_time?: string | null
          phone?: string | null
          preferred_channel?: string | null
          primary_industry?: string | null
          source?: string | null
          source_id?: string | null
          tags?: string[] | null
          total_interactions?: number | null
          updated_at?: string | null
          urgency_score?: number | null
          user_type?: string | null
        }
        Update: {
          base_profile?: Json | null
          churn_risk?: number | null
          company_name?: string | null
          country_code?: string | null
          created_at?: string | null
          email?: string | null
          engagement_score?: number | null
          full_name?: string | null
          id?: string
          intent_score?: number | null
          last_channel?: string | null
          last_interaction_at?: string | null
          lifecycle_stage?: string | null
          ltv_prediction?: number | null
          optimal_contact_time?: string | null
          phone?: string | null
          preferred_channel?: string | null
          primary_industry?: string | null
          source?: string | null
          source_id?: string | null
          tags?: string[] | null
          total_interactions?: number | null
          updated_at?: string | null
          urgency_score?: number | null
          user_type?: string | null
        }
        Relationships: []
      }
      crm_industry_nodes: {
        Row: {
          created_at: string | null
          description: string | null
          display_name: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_industry_id: string | null
          sort_order: number | null
          trigger_conditions: Json | null
          trigger_keywords: string[] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_name: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_industry_id?: string | null
          sort_order?: number | null
          trigger_conditions?: Json | null
          trigger_keywords?: string[] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_industry_id?: string | null
          sort_order?: number | null
          trigger_conditions?: Json | null
          trigger_keywords?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_industry_nodes_parent_industry_id_fkey"
            columns: ["parent_industry_id"]
            isOneToOne: false
            referencedRelation: "crm_industry_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_interactions: {
        Row: {
          ai_insights: Json | null
          channel: string
          contact_id: string
          created_at: string | null
          direction: string
          duration_seconds: number | null
          entities_extracted: Json | null
          id: string
          intent_detected: string[] | null
          occurred_at: string | null
          raw_content: Json | null
          recording_url: string | null
          sentiment: string | null
          sentiment_score: number | null
          source_id: string | null
          source_type: string | null
          summary: string | null
        }
        Insert: {
          ai_insights?: Json | null
          channel: string
          contact_id: string
          created_at?: string | null
          direction: string
          duration_seconds?: number | null
          entities_extracted?: Json | null
          id?: string
          intent_detected?: string[] | null
          occurred_at?: string | null
          raw_content?: Json | null
          recording_url?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          source_id?: string | null
          source_type?: string | null
          summary?: string | null
        }
        Update: {
          ai_insights?: Json | null
          channel?: string
          contact_id?: string
          created_at?: string | null
          direction?: string
          duration_seconds?: number | null
          entities_extracted?: Json | null
          id?: string
          intent_detected?: string[] | null
          occurred_at?: string | null
          raw_content?: Json | null
          recording_url?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          source_id?: string | null
          source_type?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
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
      crm_predictions: {
        Row: {
          acted_at: string | null
          acted_upon: boolean | null
          confidence: number | null
          contact_id: string
          generated_at: string | null
          id: string
          is_active: boolean | null
          prediction_type: string
          prediction_value: Json
          reasoning: string | null
          valid_until: string | null
        }
        Insert: {
          acted_at?: string | null
          acted_upon?: boolean | null
          confidence?: number | null
          contact_id: string
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          prediction_type: string
          prediction_value: Json
          reasoning?: string | null
          valid_until?: string | null
        }
        Update: {
          acted_at?: string | null
          acted_upon?: boolean | null
          confidence?: number | null
          contact_id?: string
          generated_at?: string | null
          id?: string
          is_active?: boolean | null
          prediction_type?: string
          prediction_value?: Json
          reasoning?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_predictions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_scores: {
        Row: {
          computed_at: string | null
          contact_id: string
          factors: Json | null
          id: string
          score_type: string
          score_value: number
          triggered_by: string | null
        }
        Insert: {
          computed_at?: string | null
          contact_id: string
          factors?: Json | null
          id?: string
          score_type: string
          score_value: number
          triggered_by?: string | null
        }
        Update: {
          computed_at?: string | null
          contact_id?: string
          factors?: Json | null
          id?: string
          score_type?: string
          score_value?: number
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_scores_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          ai_generated: boolean | null
          ai_reason: string | null
          assigned_to: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          due_at: string | null
          id: string
          optimal_time: string | null
          prediction_id: string | null
          priority: string | null
          status: string | null
          suggested_channel: string | null
          suggested_content: string | null
          task_type: string | null
          title: string
        }
        Insert: {
          ai_generated?: boolean | null
          ai_reason?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          optimal_time?: string | null
          prediction_id?: string | null
          priority?: string | null
          status?: string | null
          suggested_channel?: string | null
          suggested_content?: string | null
          task_type?: string | null
          title: string
        }
        Update: {
          ai_generated?: boolean | null
          ai_reason?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          optimal_time?: string | null
          prediction_id?: string | null
          priority?: string | null
          status?: string | null
          suggested_channel?: string | null
          suggested_content?: string | null
          task_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "crm_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_trigger_executions: {
        Row: {
          actions_executed: Json | null
          contact_id: string
          error_message: string | null
          executed_at: string | null
          execution_status: string | null
          id: string
          matched_conditions: Json | null
          trigger_id: string
        }
        Insert: {
          actions_executed?: Json | null
          contact_id: string
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          matched_conditions?: Json | null
          trigger_id: string
        }
        Update: {
          actions_executed?: Json | null
          contact_id?: string
          error_message?: string | null
          executed_at?: string | null
          execution_status?: string | null
          id?: string
          matched_conditions?: Json | null
          trigger_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_trigger_executions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_trigger_executions_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "crm_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_triggers: {
        Row: {
          actions: Json
          conditions: Json
          cooldown_minutes: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_executions_per_contact: number | null
          name: string
          priority: number | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          actions: Json
          conditions: Json
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_executions_per_contact?: number | null
          name: string
          priority?: number | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          cooldown_minutes?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_executions_per_contact?: number | null
          name?: string
          priority?: number | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      crm_variables: {
        Row: {
          confidence: number | null
          contact_id: string
          created_at: string | null
          extracted_by: string | null
          id: string
          is_current: boolean | null
          source_channel: string
          source_interaction_id: string | null
          superseded_by: string | null
          variable_name: string
          variable_type: string | null
          variable_value: string
        }
        Insert: {
          confidence?: number | null
          contact_id: string
          created_at?: string | null
          extracted_by?: string | null
          id?: string
          is_current?: boolean | null
          source_channel: string
          source_interaction_id?: string | null
          superseded_by?: string | null
          variable_name: string
          variable_type?: string | null
          variable_value: string
        }
        Update: {
          confidence?: number | null
          contact_id?: string
          created_at?: string | null
          extracted_by?: string | null
          id?: string
          is_current?: boolean | null
          source_channel?: string
          source_interaction_id?: string | null
          superseded_by?: string | null
          variable_name?: string
          variable_type?: string | null
          variable_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_variables_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
          call_duration: number | null
          call_status: string | null
          client_analysis: Json | null
          country_code: string
          created_at: string | null
          full_phone: string
          id: string
          name: string
          observability_analysis: Json | null
          observability_status: string | null
          page_url: string | null
          phone: string
          platform_analysis: Json | null
          recording_url: string | null
          ringg_call_id: string | null
          source: string | null
          transcript: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          call_duration?: number | null
          call_status?: string | null
          client_analysis?: Json | null
          country_code: string
          created_at?: string | null
          full_phone: string
          id?: string
          name: string
          observability_analysis?: Json | null
          observability_status?: string | null
          page_url?: string | null
          phone: string
          platform_analysis?: Json | null
          recording_url?: string | null
          ringg_call_id?: string | null
          source?: string | null
          transcript?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          call_duration?: number | null
          call_status?: string | null
          client_analysis?: Json | null
          country_code?: string
          created_at?: string | null
          full_phone?: string
          id?: string
          name?: string
          observability_analysis?: Json | null
          observability_status?: string | null
          page_url?: string | null
          phone?: string
          platform_analysis?: Json | null
          recording_url?: string | null
          ringg_call_id?: string | null
          source?: string | null
          transcript?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
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
