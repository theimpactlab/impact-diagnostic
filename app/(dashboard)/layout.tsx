import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import MFAReminderBanner from "@/components/dashboard/mfa-reminder-banner"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get the current user's profile with super user status and avatar
  const { data: currentUser } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_super_user, avatar_url")
    .eq("id", session.user.id)
    .single()

  if (!currentUser) {
    // Handle case where profile doesn't exist
    console.error("User profile not found")
    return (
      <div className="flex min-h-screen flex-col">
        <div className="p-8">
          <h1 className="text-xl font-bold">Error: Profile not found</h1>
          <p className="mt-2">Your user profile could not be loaded. Please try signing out and back in.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav user={currentUser} />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <MFAReminderBanner />
        {children}
      </main>
    </div>
  )
}
