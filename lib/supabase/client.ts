import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// Single browser client for the whole app. createBrowserClient returns a
// per-browser singleton and stores the session in cookies so server-side
// code (middleware, Server Components, actions) sees the same session.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
