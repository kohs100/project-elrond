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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      booth: {
        Row: {
          created_at: string
          data: Json
          event_id: number
          id: number
          items: Json | null
          jname: string
          location: string
          location_top: string | null
        }
        Insert: {
          created_at?: string
          data: Json
          event_id: number
          id?: number
          items?: Json | null
          jname: string
          location: string
          location_top?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          event_id?: number
          id?: number
          items?: Json | null
          jname?: string
          location?: string
          location_top?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booth_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
      e_demand: {
        Row: {
          booth_id: number
          created_at: string
          demander_id: number
          item: Json | null
        }
        Insert: {
          booth_id: number
          created_at?: string
          demander_id: number
          item?: Json | null
        }
        Update: {
          booth_id?: number
          created_at?: string
          demander_id?: number
          item?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "e_demand_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "e_demand_demander_id_fkey"
            columns: ["demander_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      e_supply: {
        Row: {
          booth_id: number
          created_at: string
          supplier_id: number
        }
        Insert: {
          booth_id: number
          created_at?: string
          supplier_id: number
        }
        Update: {
          booth_id?: number
          created_at?: string
          supplier_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "e_supply_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booth"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "e_supply_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      event: {
        Row: {
          created_at: string
          date: string
          fullname: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          date: string
          fullname?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          date?: string
          fullname?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      shinagaki: {
        Row: {
          booth_id: number
          created_at: string
          id: number
          url: string
        }
        Insert: {
          booth_id: number
          created_at?: string
          id?: number
          url: string
        }
        Update: {
          booth_id?: number
          created_at?: string
          id?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "shinagaki_booth_id_fkey"
            columns: ["booth_id"]
            isOneToOne: false
            referencedRelation: "booth"
            referencedColumns: ["id"]
          },
        ]
      }
      team: {
        Row: {
          created_at: string
          event_id: number | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          event_id?: number | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          event_id?: number | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          created_at: string
          id: number
          name: string
          uuid: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          uuid?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          uuid?: string | null
        }
        Relationships: []
      }
      user_team: {
        Row: {
          created_at: string
          team_id: number
          user_id: number
        }
        Insert: {
          created_at?: string
          team_id: number
          user_id: number
        }
        Update: {
          created_at?: string
          team_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_team_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "team"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_team_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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