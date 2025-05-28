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

const DOMAINS = [
  "Strategy & Governance",
  "Stakeholder Engagement",
  "Data & Measurement",
  "Impact Management",
  "Reporting & Communication",
  "Continuous Improvement",
  "External Verification",
]

export default function DomainAnalysis({ data }: DomainAnalysisProps) {
  const { scores } = data

  // Calculate domain statistics
  const domainStats = DOMAINS.map((domain) => {
    const domainScores = scores.filter((score) => score.domain === domain)
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
          <CardDescription>Detailed analysis of your performance across all impact measurement domains</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Strengths</CardTitle>
            <CardDescription>Your top performing domains</CardDescription>
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
            <CardDescription>Domains that need attention</CardDescription>
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
