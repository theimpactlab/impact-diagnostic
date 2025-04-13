import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/supabase"

export function createArrayFormatServerClient() {
  const cookieStore = cookies()

  // Get the auth cookie
  const authCookie = cookieStore.get("sb-ujjbzummjplrvhwybiqp-auth-token")?.value

  // Check if we have the fixed cookie format
  const fixedCookie = cookieStore.get("sb-ujjbzummjplrvhwybiqp-auth-token-fixed")?.value

  // Custom cookie handler to handle the array format
  const customCookieHandler = {
    get(name: string) {
      // If requesting the auth token and we have a fixed version, use that
      if (name === "sb-ujjbzummjplrvhwybiqp-auth-token" && fixedCookie) {
        return fixedCookie
      }

      // Otherwise get the normal cookie
      const cookie = cookieStore.get(name)
      return cookie?.value
    },
    set(name: string, value: string, options: any) {
      try {
        cookieStore.set({ name, value, ...options })
      } catch (error) {
        console.error("Error setting cookie:", error)
      }
    },
    remove(name: string, options: any) {
      try {
        cookieStore.set({ name, value: "", ...options })
      } catch (error) {
        console.error("Error removing cookie:", error)
      }
    },
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: customCookieHandler,
    },
  )
}
