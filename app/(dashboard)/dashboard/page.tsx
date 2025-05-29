import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Target, Users } from "lucide-react"
import FilteredProjectsList from "@/components/projects/filtered-projects-list"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Get active projects only for dashboard
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (projectsError) {
    console.error("Error fetching projects:", projectsError)
  }

  // Get all projects for metrics (including completed ones)
  const { data: allProjects } = await supabase.from("projects").select("id, status")

  // Calculate metrics
  const totalProjects = allProjects?.length || 0
  const activeProjects = projects?.length || 0
  const completedProjects = allProjects?.filter((p) => p.status === "completed").length || 0

  const metrics = [
    {
      title: "Active Projects",
      value: activeProjects,
      description: "Currently in progress",
      icon: Target,
      trend: `${totalProjects} total projects`,
    },
    {
      title: "Completed Projects",
      value: completedProjects,
      description: "Successfully finished",
      icon: TrendingUp,
      trend: `${Math.round((completedProjects / Math.max(totalProjects, 1)) * 100)}% completion rate`,
    },
    {
      title: "Organizations",
      value: new Set(allProjects?.map((p) => p.organization_name) || []).size,
      description: "Unique organizations",
      icon: Users,
      trend: "Across all projects",
    },
  ]

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your active projects.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                <p className="text-xs text-green-600 mt-1">{metric.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Active Projects Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Active Projects</h2>
          <Button variant="outline" asChild>
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>

        {projects && projects.length > 0 ? (
          <FilteredProjectsList projects={projects} showFilter={false} defaultFilter="active" />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No Active Projects</h3>
                  <p className="text-muted-foreground">
                    You don't have any active projects. Create your first project to get started.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/projects/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to help you get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-start">
              <Link href="/projects/new">
                <Plus className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Create New Project</div>
                  <div className="text-xs text-muted-foreground">Start a new impact assessment</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-start">
              <Link href="/analytics">
                <TrendingUp className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground">Analyze your impact data</div>
                </div>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-start">
              <Link href="/projects">
                <Target className="h-5 w-5 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Manage Projects</div>
                  <div className="text-xs text-muted-foreground">View and organize all projects</div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
