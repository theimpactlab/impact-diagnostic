import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"
import { getSiteUrl } from "./server-config"

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors
            console.error("Error setting cookie:", error)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // Handle cookie removal errors
            console.error("Error removing cookie:", error)
          }
        },
      },
      auth: {
        flowType: "pkce",
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        redirectTo: `${getSiteUrl()}/auth/callback`,
      },
    },
  )
}
