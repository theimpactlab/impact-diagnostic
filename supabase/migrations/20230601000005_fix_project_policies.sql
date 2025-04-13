import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import ProjectsList from "@/components/dashboard/projects-list"
import CreateProjectButton from "@/components/dashboard/create-project-button"
import ProjectDebug from "@/components/debug/project-debug"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Create a Supabase client for server components
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get projects
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .or(`owner_id.eq.${session!.user.id},project_collaborators(user_id).eq.${session!.user.id}`)
    .order("created_at", { ascending: false })

  // Log for debugging
  console.log("Dashboard projects query for user:", session!.user.id)
  console.log("Dashboard projects found:", projects?.length || 0)
  if (projectsError) {
    console.error("Error fetching projects:", projectsError)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <CreateProjectButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-2">Total Projects</h2>
          <p className="text-3xl font-bold">{projects?.length || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-2">Recent Activity</h2>
          <p className="text-gray-500">No recent activity</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-medium mb-2">Average Score</h2>
          <p className="text-3xl font-bold">-</p>
        </div>

