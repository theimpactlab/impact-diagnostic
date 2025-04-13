import { createClient } from "@supabase/supabase-js"
import { getCookie } from "cookies-next"
import type { Database } from "@/types/supabase"

// This is an improved version of the Supabase client that handles different cookie formats
export function createImprovedSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Get the auth token cookie directly
  const authTokenCookie = getCookie("sb-ujjbzummjplrvhwybiqp-auth-token")

  // Create a basic client without auth override
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  })

  return client
}
