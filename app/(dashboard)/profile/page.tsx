"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { apiFetch, useSession } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileForm from "@/components/profile/profile-form"
import PasswordForm from "@/components/profile/password-form"
import NotificationsForm from "@/components/profile/notifications-form"
import MFAForm from "@/components/profile/mfa-form"

function ProfileInner() {
  const searchParams = useSearchParams()
  const { session, loading } = useSession()
  const [organizations, setOrganizations] = useState<any[]>([])

  useEffect(() => {
    if (session) {
      apiFetch<{ organisations: any[] }>("organisations.php")
        .then((d) => setOrganizations(d.organisations || []))
        .catch(() => {})
    }
  }, [session])

  if (loading) return <p className="p-8 text-muted-foreground">Loading…</p>

  if (!session) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Your Profile</h1>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
          You need to be logged in to view your profile. Please log in and try again.
        </div>
      </div>
    )
  }

  const profileWithOrg = {
    id: String(session.user.id),
    email: session.user.email,
    full_name: session.profile.full_name || "",
    username: "",
    avatar_url: session.profile.avatar_url ?? null,
    is_super_user: !!session.profile.is_super_user,
    organization_id: session.profile.organization_id ?? null,
    organizations: session.profile.organization_id
      ? { id: String(session.profile.organization_id), name: session.profile.organization_name }
      : null,
  }

  const defaultTab = searchParams.get("tab") === "mfa" ? "mfa" : "profile"

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Profile</h1>

      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="max-w-2xl">
            <ProfileForm profile={profileWithOrg} organizations={organizations} />
          </div>
        </TabsContent>

        <TabsContent value="password">
          <div className="max-w-2xl">
            <PasswordForm />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="max-w-2xl">
            <NotificationsForm />
          </div>
        </TabsContent>

        <TabsContent value="mfa">
          <div className="max-w-2xl">
            <MFAForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileInner />
    </Suspense>
  )
}
