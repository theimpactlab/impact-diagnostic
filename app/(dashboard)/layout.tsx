"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard/dashboard-nav"
import MFAReminderBanner from "@/components/dashboard/mfa-reminder-banner"
import { useSession } from "@/lib/api"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login")
    }
  }, [loading, session, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardNav
        user={{
          id: String(session.user.id),
          email: session.user.email,
          full_name: session.profile.full_name ?? null,
          avatar_url: session.profile.avatar_url ?? null,
          is_super_user: !!session.profile.is_super_user,
        }}
      />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {!session.user.mfa_enabled && <MFAReminderBanner />}
        {children}
      </main>
    </div>
  )
}
