"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrendingUp, BarChart3, AlertCircle } from "lucide-react"
import AnalyticsCharts from "@/components/analytics/analytics-charts"
import MetricsCards from "@/components/analytics/metrics-cards"
import ProjectsTable from "@/components/analytics/projects-table"
import DomainAnalysis from "@/components/analytics/domain-analysis"
import ExportButton from "@/components/analytics/export-button"

export default function AnalyticsPage() {
  const [data, setData] = useState<{
    projects: any[]
    assessments: any[]
    scores: any[]
  } | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch<{ projects: any[] }>("projects.php"),
      apiFetch<{ assessments: any[] }>("assessments.php"),
      apiFetch<{ scores: any[] }>("scores.php"),
    ])
      .then(([p, a, s]) =>
        setData({ projects: p.projects || [], assessments: a.assessments || [], scores: s.scores || [] })
      )
      .catch(() => setError(true))
  }, [])

  if (error) {
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

  if (!data) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (data.projects.length === 0) {
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

  const completedProjects = data.projects.filter((p) => p.status === "completed").length
  const totalScores = data.scores.length

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your impact measurement capabilities</p>
        </div>
        <ExportButton data={data} />
      </div>

      {totalScores === 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Assessment Scores Needed
            </CardTitle>
            <CardDescription className="text-amber-700">
              You have {data.projects.length} projects and {data.assessments.length} assessments, but no scores have
              been recorded yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700">
              Complete your assessment questionnaires to see detailed analytics and domain performance insights.
            </p>
          </CardContent>
        </Card>
      )}

      <MetricsCards data={data} />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AnalyticsCharts data={data} />
        </TabsContent>

        <TabsContent value="domains" className="space-y-6">
          <DomainAnalysis data={data} />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <ProjectsTable data={data} />
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
