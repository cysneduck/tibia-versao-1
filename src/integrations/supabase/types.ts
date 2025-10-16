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
      characters: {
        Row: {
          created_at: string | null
          id: string
          level: number | null
          name: string
          updated_at: string | null
          user_id: string
          vocation: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          level?: number | null
          name: string
          updated_at?: string | null
          user_id: string
          vocation?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          level?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string
          vocation?: string | null
        }
        Relationships: []
      }
      claims: {
        Row: {
          character_id: string
          character_name: string
          claimed_at: string
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          released_at: string | null
          respawn_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          character_id: string
          character_name: string
          claimed_at?: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          released_at?: string | null
          respawn_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          character_id?: string
          character_name?: string
          claimed_at?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          released_at?: string | null
          respawn_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claims_respawn_id_fkey"
            columns: ["respawn_id"]
            isOneToOne: false
            referencedRelation: "respawns"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          respawn_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          respawn_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          respawn_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_respawn_id_fkey"
            columns: ["respawn_id"]
            isOneToOne: false
            referencedRelation: "respawns"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_character_id: string | null
          claim_reminders: boolean | null
          created_at: string | null
          email: string
          email_notifications: boolean | null
          first_login: boolean | null
          id: string
          onboarding_completed: boolean | null
          password_changed: boolean | null
          updated_at: string | null
        }
        Insert: {
          active_character_id?: string | null
          claim_reminders?: boolean | null
          created_at?: string | null
          email: string
          email_notifications?: boolean | null
          first_login?: boolean | null
          id: string
          onboarding_completed?: boolean | null
          password_changed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          active_character_id?: string | null
          claim_reminders?: boolean | null
          created_at?: string | null
          email?: string
          email_notifications?: boolean | null
          first_login?: boolean | null
          id?: string
          onboarding_completed?: boolean | null
          password_changed?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_active_character"
            columns: ["active_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      respawn_queue: {
        Row: {
          character_id: string
          character_name: string
          created_at: string | null
          id: string
          joined_at: string
          notified: boolean | null
          priority_expires_at: string | null
          priority_given_at: string | null
          respawn_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          character_id: string
          character_name: string
          created_at?: string | null
          id?: string
          joined_at?: string
          notified?: boolean | null
          priority_expires_at?: string | null
          priority_given_at?: string | null
          respawn_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          character_id?: string
          character_name?: string
          created_at?: string | null
          id?: string
          joined_at?: string
          notified?: boolean | null
          priority_expires_at?: string | null
          priority_given_at?: string | null
          respawn_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "respawn_queue_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "respawn_queue_respawn_id_fkey"
            columns: ["respawn_id"]
            isOneToOne: false
            referencedRelation: "respawns"
            referencedColumns: ["id"]
          },
        ]
      }
      respawns: {
        Row: {
          city: string
          code: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          city: string
          code: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          city?: string
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_respawn: {
        Args: { p_character_id: string; p_respawn_id: string }
        Returns: Json
      }
      cleanup_expired_priorities: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      ensure_user_data: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      handle_expired_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_master: {
        Args: { _user_id: string }
        Returns: boolean
      }
      is_master_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      join_respawn_queue: {
        Args: { p_character_id: string; p_respawn_id: string }
        Returns: Json
      }
      leave_respawn_queue: {
        Args: { p_respawn_id: string }
        Returns: Json
      }
      release_claim: {
        Args: { p_claim_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "guild" | "neutro" | "master_admin"
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
      app_role: ["admin", "guild", "neutro", "master_admin"],
    },
  },
} as const
