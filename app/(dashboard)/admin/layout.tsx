import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Create a Supabase client for server components
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get the session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    console.log("Admin Layout - Session:", !!session)
    console.log("Admin Layout - Session Error:", sessionError)

    // If no session, redirect to login
    if (!session || sessionError) {
      console.log("Admin Layout - No session, redirecting to login")
      redirect("/login")
    }

    // Get the user's profile with better error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, is_super_user")
      .eq("id", session.user.id)
      .single()

    // Debug logging
    console.log("Admin Layout - User ID:", session.user.id)
    console.log("Admin Layout - Profile:", profile)
    console.log("Admin Layout - Profile Error:", profileError)
    console.log("Admin Layout - Is Super User:", profile?.is_super_user)

    // If there was an error fetching the profile, redirect to dashboard
    if (profileError) {
      console.error("Error fetching profile in admin layout:", profileError)
      redirect("/dashboard?error=profile_fetch_failed")
    }

    // If profile doesn't exist, redirect to dashboard
    if (!profile) {
      console.log("No profile found, redirecting to dashboard")
      redirect("/dashboard?error=no_profile")
    }

    // If not a super user, redirect to dashboard
    if (!profile.is_super_user) {
      console.log("User is not a super user, redirecting to dashboard")
      redirect("/dashboard?error=not_super_user")
    }

    // If we get here, the user is a super user
    console.log("User is a super user, allowing access to admin")
    return <>{children}</>
  } catch (error) {
    console.error("Unexpected error in admin layout:", error)
    redirect("/dashboard?error=unexpected_error")
  }
}
