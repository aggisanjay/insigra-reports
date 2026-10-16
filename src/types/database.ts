export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          company_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          company_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedSchema: "auth";
          }
        ];
      };
      campaign_data: {
        Row: {
          id: number;
          company_name: string;
          channel: string;
          leads: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          company_name: string;
          channel: string;
          leads?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          company_name?: string;
          channel?: string;
          leads?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type CampaignRecord = Database["public"]["Tables"]["campaign_data"]["Row"];
