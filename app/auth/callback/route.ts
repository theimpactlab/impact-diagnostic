import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createServerSupabaseClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(new URL("/login?error=auth_error", request.url))
      }
    } catch (error) {
      console.error("Error in auth callback:", error)
      return NextResponse.redirect(new URL("/login?error=auth_error", request.url))
    }
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(new URL(next, request.url))
}
