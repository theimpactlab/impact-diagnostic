import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileForm from "@/components/profile/profile-form"
import PasswordForm from "@/components/profile/password-form"
import NotificationsForm from "@/components/profile/notifications-form"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user profile with organization
  const { data: profile } = await supabase
    .from("profiles")
    .select(`
      *,
      organizations (
        id,
        name
      )
    `)
    .eq("id", session!.user.id)
    .single()

  // Get all organizations
  const { data: organizations } = await supabase.from("organizations").select("*").order("name")

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Your Profile</h1>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="max-w-2xl">
            <ProfileForm profile={profile} organizations={organizations || []} />
          </div>
        </TabsContent>

        <TabsContent value="password">
          <div className="max-w-2xl">
            <PasswordForm />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="max-w-2xl">
            <NotificationsForm userId={session!.user.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
