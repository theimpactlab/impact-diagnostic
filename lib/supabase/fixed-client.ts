import { createClient } from "@supabase/supabase-js"
import { getCookie } from "cookies-next"
import type { Database } from "@/types/supabase"

// This is a fixed version of the Supabase client that explicitly uses the auth token cookie
export function createFixedSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Get the auth token cookie directly
  const authTokenCookie = getCookie("sb-ujjbzummjplrvhwybiqp-auth-token")

  // Create client with auth override if we have a token
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
    global: {
      headers: authTokenCookie
        ? {
            Authorization: `Bearer ${JSON.parse(authTokenCookie as string).access_token}`,
          }
        : undefined,
    },
  })

  return client
}
