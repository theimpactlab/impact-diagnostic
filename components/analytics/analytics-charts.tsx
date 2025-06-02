"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface AnalyticsData {
  projects: any[]
  assessments: any[]
  scores: any[]
}

interface AnalyticsChartsProps {
  data: AnalyticsData
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"]

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { projects, assessments, scores } = data

  // Get completed projects only
  const completedProjects = projects.filter((project) => project.status === "completed")
  const completedProjectIds = completedProjects.map((project) => project.id)

  // Get assessments for completed projects
  const completedAssessments = assessments.filter((assessment) => completedProjectIds.includes(assessment.project_id))
  const completedAssessmentIds = completedAssessments.map((assessment) => assessment.id)

  // Get scores for completed assessments
  const completedScores = scores.filter((score) => completedAssessmentIds.includes(score.assessment_id))

  // Prepare data for charts
  const projectsByMonth = projects.reduce((acc, project) => {
    const month = new Date(project.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {})

  const monthlyData = Object.entries(projectsByMonth).map(([month, count]) => ({
    month,
    projects: count,
  }))

  // Domain scores data - using actual domains from scores
  const uniqueDomains = Array.from(new Set(completedScores.map((score) => score.domain)))

  const domainScores = uniqueDomains.reduce(
    (acc, domain) => {
      const domainScores = completedScores.filter((score) => score.domain === domain)
      acc[domain] = {
        domain,
        totalScore: domainScores.reduce((sum, score) => sum + score.score, 0),
        count: domainScores.length,
      }
      return acc
    },
    {} as Record<string, { domain: string; totalScore: number; count: number }>,
  )

  const domainData = Object.values(domainScores).map((domain) => ({
    domain: domain.domain,
    averageScore: domain.count > 0 ? domain.totalScore / domain.count : 0,
  }))

  // Organization distribution
  const orgDistribution = completedProjects.reduce((acc, project) => {
    const org = project.organization_name || "Unknown"
    acc[org] = (acc[org] || 0) + 1
    return acc
  }, {})

  const orgData = Object.entries(orgDistribution).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Projects Over Time</CardTitle>
          <CardDescription>Number of projects created each month</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No project data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="projects" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Distribution</CardTitle>
          <CardDescription>Completed projects by organization</CardDescription>
        </CardHeader>
        <CardContent>
          {orgData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              No completed projects data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orgData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orgData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {domainData.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Average Scores by Domain</CardTitle>
            <CardDescription>Performance across different domains in completed projects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={domainData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="averageScore" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
