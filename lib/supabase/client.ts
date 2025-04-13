import { createClient } from "@supabase/supabase-js"
import { getAuthCallbackUrl } from "./server-config"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
    // Use the auth callback URL for redirects
    redirectTo: getAuthCallbackUrl(),
    storageKey: "impact-diagnostic-auth",
  },
})
