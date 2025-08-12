export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          ai_suggestions: string | null
          confidence_scores: Json
          confidence_threshold: number | null
          created_at: string
          detected_foods: Json
          final_analysis: Json | null
          id: string
          manual_corrections: Json | null
          meal_log_id: string
          nutritional_analysis: Json
          processing_time_ms: number | null
          requires_manual_review: boolean | null
        }
        Insert: {
          ai_suggestions?: string | null
          confidence_scores?: Json
          confidence_threshold?: number | null
          created_at?: string
          detected_foods?: Json
          final_analysis?: Json | null
          id?: string
          manual_corrections?: Json | null
          meal_log_id: string
          nutritional_analysis?: Json
          processing_time_ms?: number | null
          requires_manual_review?: boolean | null
        }
        Update: {
          ai_suggestions?: string | null
          confidence_scores?: Json
          confidence_threshold?: number | null
          created_at?: string
          detected_foods?: Json
          final_analysis?: Json | null
          id?: string
          manual_corrections?: Json | null
          meal_log_id?: string
          nutritional_analysis?: Json
          processing_time_ms?: number | null
          requires_manual_review?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_analysis_meal_log_id_fkey"
            columns: ["meal_log_id"]
            isOneToOne: false
            referencedRelation: "meal_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assessments: {
        Row: {
          assessment_data: Json
          assessment_type: string
          created_at: string
          health_insights: string | null
          id: string
          motivational_message: string | null
          progress_score: number | null
          recommendations: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assessment_data?: Json
          assessment_type?: string
          created_at?: string
          health_insights?: string | null
          id?: string
          motivational_message?: string | null
          progress_score?: number | null
          recommendations?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assessment_data?: Json
          assessment_type?: string
          created_at?: string
          health_insights?: string | null
          id?: string
          motivational_message?: string | null
          progress_score?: number | null
          recommendations?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_meals: {
        Row: {
          created_at: string
          id: string
          meal_name: string
          meal_type: string
          recipe: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_name: string
          meal_type: string
          recipe: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_name?: string
          meal_type?: string
          recipe?: Json
          user_id?: string
        }
        Relationships: []
      }
      foods: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number
          category: string | null
          created_at: string
          fat_per_100g: number
          fiber_per_100g: number
          id: string
          is_turkish_cuisine: boolean | null
          name: string
          name_en: string | null
          protein_per_100g: number
          sodium_per_100g: number | null
          sugar_per_100g: number | null
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g?: number
          category?: string | null
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          is_turkish_cuisine?: boolean | null
          name: string
          name_en?: string | null
          protein_per_100g?: number
          sodium_per_100g?: number | null
          sugar_per_100g?: number | null
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number
          category?: string | null
          created_at?: string
          fat_per_100g?: number
          fiber_per_100g?: number
          id?: string
          is_turkish_cuisine?: boolean | null
          name?: string
          name_en?: string | null
          protein_per_100g?: number
          sodium_per_100g?: number | null
          sugar_per_100g?: number | null
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          created_at: string
          date: string
          food_items: Json
          id: string
          meal_type: string
          notes: string | null
          photo_url: string | null
          total_calories: number
          total_carbs: number
          total_fat: number
          total_fiber: number | null
          total_protein: number
          total_sodium: number | null
          total_sugar: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          food_items?: Json
          id?: string
          meal_type: string
          notes?: string | null
          photo_url?: string | null
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_fiber?: number | null
          total_protein?: number
          total_sodium?: number | null
          total_sugar?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          food_items?: Json
          id?: string
          meal_type?: string
          notes?: string | null
          photo_url?: string | null
          total_calories?: number
          total_carbs?: number
          total_fat?: number
          total_fiber?: number | null
          total_protein?: number
          total_sodium?: number | null
          total_sugar?: number | null
          user_id?: string
        }
        Relationships: []
      }
      meal_suggestions: {
        Row: {
          generated_at: string
          id: string
          meal_type: string
          suggestion_data: Json
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          meal_type: string
          suggestion_data: Json
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          meal_type?: string
          suggestion_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          scheduled_for: string
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          scheduled_for: string
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          scheduled_for?: string
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          created_at: string
          daily_calorie_goal: number | null
          daily_carbs_goal: number | null
          daily_fat_goal: number | null
          daily_protein_goal: number | null
          diet_goal: string | null
          gender: string | null
          height: number | null
          id: string
          name: string | null
          onboarding_completed: boolean | null
          subscription_status: string | null
          trial_end_date: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          daily_calorie_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          diet_goal?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          created_at?: string
          daily_calorie_goal?: number | null
          daily_carbs_goal?: number | null
          daily_fat_goal?: number | null
          daily_protein_goal?: number | null
          diet_goal?: string | null
          gender?: string | null
          height?: number | null
          id?: string
          name?: string | null
          onboarding_completed?: boolean | null
          subscription_status?: string | null
          trial_end_date?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string
          currency: string | null
          end_date: string | null
          id: string
          order_id: string | null
          plan_type: string
          price_amount: number | null
          purchase_token: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          order_id?: string | null
          plan_type: string
          price_amount?: number | null
          purchase_token?: string | null
          start_date?: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          order_id?: string | null
          plan_type?: string
          price_amount?: number | null
          purchase_token?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          action_type: string
          created_at: string
          data: Json
          id: string
          status: string
          synced_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          data: Json
          id?: string
          status?: string
          synced_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          data?: Json
          id?: string
          status?: string
          synced_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          notification_settings: Json
          reminder_times: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_settings?: Json
          reminder_times?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_settings?: Json
          reminder_times?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      search_foods: {
        Args: { search_term: string }
        Returns: {
          id: string
          name: string
          name_en: string
          calories_per_100g: number
          protein_per_100g: number
          carbs_per_100g: number
          fat_per_100g: number
          category: string
          similarity: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
