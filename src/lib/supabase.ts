import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Create Supabase client for server-side operations (with service role key)
// Only create if service key is available
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database types (we'll generate these later)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          username: string | null;
          email: string | null;
          avatar_url: string | null;
          bio: string | null;
          location: any;
          friends: string[];
          blocked_users: string[];
          notification_settings: any;
          is_online: boolean;
          last_seen: string | null;
          // Onboarding fields
          onboarding_status: 'signup' | 'email_verification' | 'profile_setup' | 'welcome' | 'tour' | 'completed';
          profile_completed: boolean;
          onboarding_completed_at: string | null;
          tour_completed: boolean;
          welcome_message_sent: boolean;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Enums: {
      onboarding_step: 'signup' | 'email_verification' | 'profile_setup' | 'welcome' | 'tour' | 'completed';
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

