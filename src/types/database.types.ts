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
      debts: {
        Row: {
          id: string;
          user_id: string;
          type: "owed_to_me" | "i_owe";
          counterpart_name: string;
          amount: number;
          note: string | null;
          debt_date: string;
          due_date: string | null;
          settled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          type: "owed_to_me" | "i_owe";
          counterpart_name: string;
          amount: number;
          note?: string | null;
          debt_date?: string;
          due_date?: string | null;
          settled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "owed_to_me" | "i_owe";
          counterpart_name?: string;
          amount?: number;
          note?: string | null;
          debt_date?: string;
          due_date?: string | null;
          settled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      debt_summary: {
        Args: Record<PropertyKey, never>;
        Returns: {
          owed_to_me: number;
          i_owe: number;
          open_count: number;
        }[];
      };
    };
    Enums: {
      debt_type: "owed_to_me" | "i_owe";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
