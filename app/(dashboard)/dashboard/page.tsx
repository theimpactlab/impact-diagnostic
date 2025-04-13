import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import ProjectsList from "@/components/dashboard/projects-list"
import CreateProjectButton from "@/components/dashboard/create-project-button"
import { Button } from "@/components/ui/button"
import { Bug } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  // Create a Supabase client for server components
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get projects using a simpler query that avoids complex joins
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
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
        <div className="flex gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/debug">
              <Bug className="h-4 w-4 mr-2" />
              Debug Tools
            </Link>
          </Button>
          <CreateProjectButton />
        </div>
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
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
      <ProjectsList projects={projects || []} />

      {projects?.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mt-4">
          <h3 className="font-medium text-yellow-800">No projects found</h3>
          <p className="text-yellow-700 mt-1">
            If you've created projects but don't see them here, please check the
            <Link href="/debug" className="text-yellow-800 underline ml-1">
              debug page
            </Link>
            for more information.
          </p>
        </div>
      )}
    </div>
  )
}
