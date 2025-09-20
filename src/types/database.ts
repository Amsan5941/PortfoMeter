export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string | null;
          first_name: string | null;
          last_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      uploads: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          ocr_status: string;
          ocr_results: Record<string, unknown> | null;
          ai_review: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          mime_type?: string | null;
          ocr_status?: string;
          ocr_results?: Record<string, unknown> | null;
          ai_review?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          mime_type?: string | null;
          ocr_status?: string;
          ocr_results?: Record<string, unknown> | null;
          ai_review?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      holdings: {
        Row: {
          id: string;
          upload_id: string;
          symbol: string;
          company_name: string | null;
          quantity: number | null;
          price: number | null;
          cost_basis: number | null;
          market_value: number | null;
          confidence_score: number | null;
          is_verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          upload_id: string;
          symbol: string;
          company_name?: string | null;
          quantity?: number | null;
          price?: number | null;
          cost_basis?: number | null;
          market_value?: number | null;
          confidence_score?: number | null;
          is_verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          upload_id?: string;
          symbol?: string;
          company_name?: string | null;
          quantity?: number | null;
          price?: number | null;
          cost_basis?: number | null;
          market_value?: number | null;
          confidence_score?: number | null;
          is_verified?: boolean;
          created_at?: string;
        };
      };
      stock_symbols: {
        Row: {
          id: string;
          symbol: string;
          company_name: string;
          exchange: string | null;
          sector: string | null;
          industry: string | null;
          market_cap: number | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          company_name: string;
          exchange?: string | null;
          sector?: string | null;
          industry?: string | null;
          market_cap?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          company_name?: string;
          exchange?: string | null;
          sector?: string | null;
          industry?: string | null;
          market_cap?: number | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_quotes: {
        Row: {
          id: string;
          symbol: string;
          price: number | null;
          change_amount: number | null;
          change_percent: number | null;
          volume: number | null;
          market_cap: number | null;
          pe_ratio: number | null;
          high_52w: number | null;
          low_52w: number | null;
          last_updated: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          price?: number | null;
          change_amount?: number | null;
          change_percent?: number | null;
          volume?: number | null;
          market_cap?: number | null;
          pe_ratio?: number | null;
          high_52w?: number | null;
          low_52w?: number | null;
          last_updated?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          price?: number | null;
          change_amount?: number | null;
          change_percent?: number | null;
          volume?: number | null;
          market_cap?: number | null;
          pe_ratio?: number | null;
          high_52w?: number | null;
          low_52w?: number | null;
          last_updated?: string;
        };
      };
      search_events: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          search_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          search_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          search_type?: string;
          created_at?: string;
        };
      };
      market_movers: {
        Row: {
          id: string;
          symbol: string;
          change_percent: number;
          change_amount: number;
          volume: number | null;
          mover_type: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          change_percent: number;
          change_amount: number;
          volume?: number | null;
          mover_type: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          change_percent?: number;
          change_amount?: number;
          volume?: number | null;
          mover_type?: string;
          date?: string;
          created_at?: string;
        };
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
  };
}
