import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    // This is critical - it tells the client to use the same
    // cookies that the server uses, maintaining the session
    name: "sb-" + supabaseUrl.split("//")[1].split(".")[0],
  },
  auth: {
    flowType: "pkce",
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
})
