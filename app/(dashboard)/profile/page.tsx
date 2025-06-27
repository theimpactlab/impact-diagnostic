import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileForm from "@/components/profile/profile-form"
import PasswordForm from "@/components/profile/password-form"
import NotificationsForm from "@/components/profile/notifications-form"
import MFAForm from "@/components/profile/mfa-form"

export const dynamic = "force-dynamic"

export default async function ProfilePage({
  searchParams
}: {
  searchParams: { tab?: string }
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

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

  // Get user profile with organization - use a simpler query to avoid relationship issues
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Get organization separately if profile exists
  let organization = null
  if (profile?.organization_id) {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("id", profile.organization_id)
      .single()

    organization = orgData
  }

  // Combine profile and organization data
  const profileWithOrg = profile
    ? {
      ...profile,
      organizations: organization,
    }
    : {
      id: session.user.id,
      email: session.user.email,
      full_name: "",
      username: "",
      avatar_url: null,
      is_super_user: false,
      organizations: null,
    }

  // Get all organizations
  const { data: organizations } = await supabase.from("organizations").select("*").order("name")

  // Determine the default tab from search params
  const defaultTab = searchParams.tab === 'mfa' ? 'mfa' : 'profile'

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
            <ProfileForm profile={profileWithOrg} organizations={organizations || []} />
          </div>
        </TabsContent>

        <TabsContent value="password">
          <div className="max-w-2xl">
            <PasswordForm />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="max-w-2xl">
            <NotificationsForm userId={session.user.id} />
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
