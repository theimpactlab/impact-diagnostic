import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3 } from "lucide-react"
import AnalyticsCharts from "@/components/analytics/analytics-charts"
import MetricsCards from "@/components/analytics/metrics-cards"
import ProjectsTable from "@/components/analytics/projects-table"
import DomainAnalysis from "@/components/analytics/domain-analysis"
import ExportButton from "@/components/analytics/export-button"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AnalyticsPage() {
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
            <CardDescription>Please log in to view analytics</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Get all projects with status
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, created_at, organization_name, status")
    .order("created_at", { ascending: false })

  if (projectsError) {
    console.error("Error fetching projects:", projectsError)
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Data</CardTitle>
            <CardDescription>There was an error loading your analytics data. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <BarChart3 className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">No Data Available</h1>
            <p className="text-muted-foreground mb-6">
              You need to create projects and complete assessments to see analytics.
            </p>
            <Button asChild>
              <a href="/dashboard">Create Your First Project</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Get all assessments for these projects
  const projectIds = projects.map((p) => p.id)
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, project_id, created_at, updated_at")
    .in("project_id", projectIds)

  // Get all scores for these assessments
  const assessmentIds = assessments?.map((a) => a.id) || []
  const { data: scores, error: scoresError } = await supabase
    .from("scores")
    .select("assessment_id, domain, score, created_at")
    .in("assessment_id", assessmentIds)

  const analyticsData = {
    projects: projects || [],
    assessments: assessments || [],
    scores: scores || [],
  }

  // Count completed projects
  const completedProjects = projects.filter((p) => p.status === "completed").length

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your impact measurement capabilities</p>
        </div>
        <ExportButton data={analyticsData} />
      </div>

      <MetricsCards data={analyticsData} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsCharts data={analyticsData} />
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          {completedProjects === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">No Completed Projects</h3>
                    <p className="text-muted-foreground">
                      Domain analysis is available for completed projects only. Mark projects as completed to see domain
                      analysis.
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <a href="/projects">Manage Projects</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DomainAnalysis data={analyticsData} />
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsTable data={analyticsData} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trends Analysis</CardTitle>
              <CardDescription>Track your progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <p>Trends analysis will be available with more assessment data</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
