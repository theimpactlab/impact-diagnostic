import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface AnalyticsData {
  projects: any[]
  assessments: any[]
  scores: any[]
}

interface DomainAnalysisProps {
  data: AnalyticsData
}

export default function DomainAnalysis({ data }: DomainAnalysisProps) {
  const { projects, assessments, scores } = data

  // Get completed projects only
  const completedProjects = projects.filter((project) => project.status === "completed")
  const completedProjectIds = completedProjects.map((project) => project.id)

  // Get assessments for completed projects
  const completedAssessments = assessments.filter((assessment) => completedProjectIds.includes(assessment.project_id))
  const completedAssessmentIds = completedAssessments.map((assessment) => assessment.id)

  // Get scores for completed assessments
  const completedScores = scores.filter((score) => completedAssessmentIds.includes(score.assessment_id))

  // Extract unique domains from the scores data
  const uniqueDomains = Array.from(new Set(completedScores.map((score) => score.domain)))

  // Calculate domain statistics
  const domainStats = uniqueDomains.map((domain) => {
    const domainScores = completedScores.filter((score) => score.domain === domain)
    const averageScore =
      domainScores.length > 0 ? domainScores.reduce((sum, s) => sum + s.score, 0) / domainScores.length : 0
    const assessmentCount = domainScores.length

    let performance = "Not Assessed"
    let color = "secondary"

    if (averageScore > 0) {
      if (averageScore >= 4) {
        performance = "Excellent"
        color = "default"
      } else if (averageScore >= 3) {
        performance = "Good"
        color = "secondary"
      } else if (averageScore >= 2) {
        performance = "Fair"
        color = "outline"
      } else {
        performance = "Needs Improvement"
        color = "destructive"
      }
    }

    return {
      domain,
      averageScore,
      assessmentCount,
      performance,
      color,
      progress: (averageScore / 5) * 100,
    }
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Domain Performance Overview</CardTitle>
          <CardDescription>Analysis of your performance across all domains for completed projects only</CardDescription>
        </CardHeader>
        <CardContent>
          {domainStats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No domain data available for completed projects</p>
              <p className="text-sm mt-2">Complete some projects to see domain analysis</p>
            </div>
          ) : (
            <div className="space-y-6">
              {domainStats.map((stat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{stat.domain}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={stat.color as any}>{stat.performance}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {stat.assessmentCount} assessment{stat.assessmentCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {stat.averageScore > 0 ? stat.averageScore.toFixed(1) : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">out of 5</div>
                    </div>
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
            <CardDescription>Your top performing domains in completed projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {domainStats
                .filter((stat) => stat.averageScore >= 3)
                .sort((a, b) => b.averageScore - a.averageScore)
                .slice(0, 3)
                .map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{stat.domain}</span>
                    <Badge variant="default">{stat.averageScore.toFixed(1)}</Badge>
                  </div>
                ))}
              {domainStats.filter((stat) => stat.averageScore >= 3).length === 0 && (
                <p className="text-sm text-muted-foreground">Complete more assessments to identify strengths</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>Domains that need attention in completed projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {domainStats
                .filter((stat) => stat.averageScore > 0 && stat.averageScore < 3)
                .sort((a, b) => a.averageScore - b.averageScore)
                .slice(0, 3)
                .map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{stat.domain}</span>
                    <Badge variant="outline">{stat.averageScore.toFixed(1)}</Badge>
                  </div>
                ))}
              {domainStats.filter((stat) => stat.averageScore > 0 && stat.averageScore < 3).length === 0 && (
                <p className="text-sm text-muted-foreground">No areas needing improvement identified</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
