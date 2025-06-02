import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DashboardNav from "@/components/dashboard/dashboard-nav"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  // Get user profile - use a simpler query to avoid relationship issues
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Create a fallback profile if none exists
  const userProfile = profile || {
    id: session.user.id,
    email: session.user.email,
    full_name: null,
    avatar_url: null,
    is_super_user: false,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={userProfile} />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full flex justify-center">
          <div className="w-full max-w-7xl">{children}</div>
        </div>
      </main>
    </div>
  )
}