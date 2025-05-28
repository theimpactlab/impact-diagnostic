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

  // Calculate metrics
  const totalProjects = projects.length
  const totalAssessments = assessments.length
  const completedAssessments = assessments.filter((a) => a.updated_at !== a.created_at).length
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score.score, 0) / scores.length : 0

  const metrics = [
    {
      title: "Total Projects",
      value: totalProjects,
      description: "Active projects in your portfolio",
      icon: Target,
      trend: "+12% from last month",
    },
    {
      title: "Assessments",
      value: totalAssessments,
      description: "Impact assessments conducted",
      icon: BarChart3,
      trend: `${completedAssessments} completed`,
    },
    {
      title: "Average Score",
      value: averageScore.toFixed(1),
      description: "Across all domains",
      icon: TrendingUp,
      trend: scores.length > 0 ? "Based on current data" : "No scores yet",
    },
    {
      title: "Organizations",
      value: new Set(projects.map((p) => p.organization_name)).size,
      description: "Unique organizations",
      icon: Users,
      trend: "Across all projects",
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
