import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import UsersManagement from "@/components/admin/users-management"
import OrganizationsManagement from "@/components/admin/organizations-management"
import ProjectsManagement from "@/components/admin/projects-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  // Create a Supabase client
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get user profile with separate queries to avoid the relationship error
  let profile = null
  let isSuperUser = false
  let organizations = []

  try {
    // Get profile without joining organizations
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, is_super_user, organization_id")
      .eq("id", session.user.id)
      .single()

    if (profileError) {
      console.error("Profile error:", profileError)
    } else {
      profile = profileData
      isSuperUser = !!profileData?.is_super_user
    }

    // Get organizations in a separate query
    const { data: orgsData, error: orgsError } = await supabase.from("organizations").select("*")

    if (orgsError) {
      console.error("Organizations error:", orgsError)
    } else {
      organizations = orgsData || []
    }

    // If user has an organization_id, get the organization name
    if (profile?.organization_id) {
      const { data: orgData } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", profile.organization_id)
        .single()

      if (orgData) {
        profile.organization_name = orgData.name
      }
    }
  } catch (e) {
    console.error("Unexpected error:", e)
  }

  // If not a super user, show access denied
  if (!isSuperUser) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Access Denied</p>
          <p>You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  // Get all users with their organizations
  const { data: users } = await supabase.from("profiles").select("*")

  // Process users to include organization names
  const processedUsers = await Promise.all(
    (users || []).map(async (user) => {
      if (user.organization_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", user.organization_id)
          .single()

        return {
          ...user,
          organization_name: org?.name || null,
        }
      }
      return {
        ...user,
        organization_name: null,
      }
    }),
  )

  // Get all projects with owner information
  const { data: projects } = await supabase.from("projects").select("*")

  // Process projects to include owner information
  const processedProjects = await Promise.all(
    (projects || []).map(async (project) => {
      // Get owner information
      const { data: owner } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", project.owner_id)
        .single()

      return {
        ...project,
        owner_email: owner?.email || null,
        owner_name: owner?.full_name || null,
      }
    }),
  )

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="users" className="space-y-8">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersManagement users={processedUsers} organizations={organizations} />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationsManagement organizations={organizations} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsManagement projects={processedProjects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
