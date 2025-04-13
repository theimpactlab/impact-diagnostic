import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Create a Supabase client for server components
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If no session, redirect to login
  if (!session) {
    redirect("/login")
  }

  // Get user profile to check if they're an admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Check if user is an admin, if not redirect to dashboard
  if (!profile?.is_admin) {
    redirect("/dashboard")
  }

  // We don't need to include the DashboardNav here since it's already in the parent layout
  return <>{children}</>
}
