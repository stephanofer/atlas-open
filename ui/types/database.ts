// Tipos generados para Supabase Database
// Estos tipos reflejan exactamente el esquema de la base de datos

// =====================================================
// ENUMS
// =====================================================

export const USER_ROLE = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  USER: "user",
} as const;

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const DOCUMENT_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  DERIVED: "derived",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

export type DocumentStatus =
  (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

export const HISTORY_ACTION_TYPE = {
  UPLOADED: "uploaded",
  VIEWED: "viewed",
  DOWNLOADED: "downloaded",
  DERIVED: "derived",
  STATUS_CHANGED: "status_changed",
} as const;

export type HistoryActionType =
  (typeof HISTORY_ACTION_TYPE)[keyof typeof HISTORY_ACTION_TYPE];

export const NOTIFICATION_TYPE = {
  ASSIGNED: "assigned",
  DERIVED: "derived",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

// =====================================================
// TABLE TYPES
// =====================================================

export interface Company {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  position: string | null;
  area_id: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  title: string;
  category_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  status: DocumentStatus;
  current_area_id: string | null;
  current_user_id: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentHistory {
  id: string;
  document_id: string;
  company_id: string;
  action_type: HistoryActionType;
  performed_by: string;
  from_area_id: string | null;
  to_area_id: string | null;
  to_user_id: string | null;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  company_id: string;
  recipient_id: string;
  document_id: string;
  triggered_by: string;
  type: NotificationType;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

// =====================================================
// DATABASE TYPE (para Supabase Client v2)
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          role: UserRole;
          position: string | null;
          area_id: string | null;
          status: UserStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          role?: UserRole;
          position?: string | null;
          area_id?: string | null;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          position?: string | null;
          area_id?: string | null;
          status?: UserStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_profiles_area";
            columns: ["area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          }
        ];
      };
      areas: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "areas_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          category_id: string;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          status: DocumentStatus;
          current_area_id: string | null;
          current_user_id: string | null;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          category_id: string;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          status?: DocumentStatus;
          current_area_id?: string | null;
          current_user_id?: string | null;
          uploaded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          category_id?: string;
          file_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          status?: DocumentStatus;
          current_area_id?: string | null;
          current_user_id?: string | null;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_current_area_id_fkey";
            columns: ["current_area_id"];
            isOneToOne: false;
            referencedRelation: "areas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_current_user_id_fkey";
            columns: ["current_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      document_history: {
        Row: {
          id: string;
          document_id: string;
          company_id: string;
          action_type: HistoryActionType;
          performed_by: string;
          from_area_id: string | null;
          to_area_id: string | null;
          to_user_id: string | null;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          company_id: string;
          action_type: HistoryActionType;
          performed_by: string;
          from_area_id?: string | null;
          to_area_id?: string | null;
          to_user_id?: string | null;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          company_id?: string;
          action_type?: HistoryActionType;
          performed_by?: string;
          from_area_id?: string | null;
          to_area_id?: string | null;
          to_user_id?: string | null;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_history_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_history_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_history_performed_by_fkey";
            columns: ["performed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notifications: {
        Row: {
          id: string;
          company_id: string;
          recipient_id: string;
          document_id: string;
          triggered_by: string;
          type: NotificationType;
          title: string;
          message: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          recipient_id: string;
          document_id: string;
          triggered_by: string;
          type: NotificationType;
          title: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          recipient_id?: string;
          document_id?: string;
          triggered_by?: string;
          type?: NotificationType;
          title?: string;
          message?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey";
            columns: ["recipient_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_triggered_by_fkey";
            columns: ["triggered_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_company_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      is_user_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_default_categories: {
        Args: {
          p_company_id: string;
        };
        Returns: undefined;
      };
      register_new_account: {
        Args: {
          p_user_id: string;
          p_email: string;
          p_full_name: string;
          p_company_name: string;
        };
        Returns: {
          company_id: string;
          success: boolean;
        };
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      document_status: DocumentStatus;
      history_action_type: HistoryActionType;
      notification_type: NotificationType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types
type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;
