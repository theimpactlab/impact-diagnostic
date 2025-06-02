import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import UsersManagement from "@/components/admin/users-management"
import OrganizationsManagement from "@/components/admin/organizations-management"
import ProjectsManagement from "@/components/admin/projects-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  // Create a Supabase client
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get the session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      redirect("/login")
    }

    console.log("Admin Page - User ID:", session.user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, is_super_user, organization_id")
      .eq("id", session.user.id)
      .single()

    console.log("Admin Page - Profile:", profile)
    console.log("Admin Page - Profile Error:", profileError)

    if (profileError || !profile) {
      return (
        <div className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Profile</AlertTitle>
            <AlertDescription>{profileError?.message || "Could not load user profile"}</AlertDescription>
          </Alert>
        </div>
      )
    }

    // Double-check super user status
    if (!profile.is_super_user) {
      return (
        <div className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You do not have permission to access the admin dashboard.
              <br />
              Profile: {JSON.stringify({ email: profile.email, is_super_user: profile.is_super_user })}
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    // Get organizations
    const { data: organizations, error: orgsError } = await supabase.from("organizations").select("*")

    if (orgsError) {
      console.error("Organizations error:", orgsError)
    }

    // Get all users with their organizations
    const { data: users, error: usersError } = await supabase.from("profiles").select("*")

    if (usersError) {
      console.error("Users error:", usersError)
    }

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
    const { data: projects, error: projectsError } = await supabase.from("projects").select("*")

    if (projectsError) {
      console.error("Projects error:", projectsError)
    }

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

    console.log("Admin Page - Data loaded successfully")
    console.log("Admin Page - Users:", processedUsers?.length || 0)
    console.log("Admin Page - Organizations:", organizations?.length || 0)
    console.log("Admin Page - Projects:", processedProjects?.length || 0)

    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="text-sm text-muted-foreground">Logged in as: {profile.email} (Super User)</div>
        </div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList>
            <TabsTrigger value="users">Users ({processedUsers?.length || 0})</TabsTrigger>
            <TabsTrigger value="organizations">Organizations ({organizations?.length || 0})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({processedProjects?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersManagement users={processedUsers || []} organizations={organizations || []} />
          </TabsContent>

          <TabsContent value="organizations">
            <OrganizationsManagement organizations={organizations || []} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsManagement projects={processedProjects || []} />
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in admin page:", error)
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unexpected Error</AlertTitle>
          <AlertDescription>
            An unexpected error occurred: {error instanceof Error ? error.message : "Unknown error"}
          </AlertDescription>
        </Alert>
      </div>
    )
  }
}
