import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          title: string
          location: string
          rent_price: number
          property_type: string
          tenant_preference: string
          contact_number: string
          description: string
          owner_id: string
          images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          location: string
          rent_price: number
          property_type: string
          tenant_preference: string
          contact_number: string
          description: string
          owner_id: string
          images?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          location?: string
          rent_price?: number
          property_type?: string
          tenant_preference?: string
          contact_number?: string
          description?: string
          owner_id?: string
          images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

