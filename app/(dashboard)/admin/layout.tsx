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

  // Simple check for super user status
  const { data: profile } = await supabase.from("profiles").select("is_super_user").eq("id", session.user.id).single()

  // If not a super user, redirect to dashboard
  if (!profile?.is_super_user) {
    redirect("/dashboard")
  }

  // We don't need to include the DashboardNav here since it's already in the parent layout
  return <>{children}</>
}
