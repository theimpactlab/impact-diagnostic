import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Target, BarChart3 } from "lucide-react"

interface AnalyticsData {
  projects: any[]
  assessments: any[]
  scores: any[]
}

interface MetricsCardsProps {
  data: AnalyticsData
}

export default function MetricsCards({ data }: MetricsCardsProps) {
  const { projects, assessments, scores } = data

  // Get completed projects only
  const completedProjects = projects.filter((project) => project.status === "completed")
  const completedProjectIds = completedProjects.map((project) => project.id)

  // Get assessments for completed projects
  const completedAssessments = assessments.filter((assessment) => completedProjectIds.includes(assessment.project_id))
  const completedAssessmentIds = completedAssessments.map((assessment) => assessment.id)

  // Get scores for completed assessments
  const completedScores = scores.filter((score) => completedAssessmentIds.includes(score.assessment_id))

  // Calculate metrics
  const totalProjects = projects.length
  const completedProjectsCount = completedProjects.length
  const totalAssessments = assessments.length
  const completedAssessmentsCount = completedAssessments.length

  // Calculate average score for completed projects only
  const averageScore =
    completedScores.length > 0
      ? completedScores.reduce((sum, score) => sum + score.score, 0) / completedScores.length
      : 0

  // Get unique domains from completed scores
  const uniqueDomains = Array.from(new Set(completedScores.map((score) => score.domain)))

  const metrics = [
    {
      title: "Total Projects",
      value: totalProjects,
      description: `${completedProjectsCount} completed`,
      icon: Target,
      trend: `${projects.filter((p) => p.status === "active").length} active`,
    },
    {
      title: "Assessments",
      value: totalAssessments,
      description: `${completedAssessmentsCount} in completed projects`,
      icon: BarChart3,
      trend: `Across ${totalProjects} projects`,
    },
    {
      title: "Average Score",
      value: averageScore.toFixed(1),
      description: "In completed projects",
      icon: TrendingUp,
      trend: completedScores.length > 0 ? `Based on ${completedScores.length} scores` : "No scores yet",
    },
    {
      title: "Domains Assessed",
      value: uniqueDomains.length,
      description: "Unique assessment domains",
      icon: Users,
      trend: completedScores.length > 0 ? "From completed projects" : "No domains assessed yet",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
  )
}
