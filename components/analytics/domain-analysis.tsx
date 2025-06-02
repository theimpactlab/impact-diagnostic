import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircle, FileText } from "lucide-react"

interface AnalyticsData {
  projects: any[]
  assessments: any[]
  scores: any[]
}

interface DomainAnalysisProps {
  data: AnalyticsData
}

// Domain mapping from database field names to display names
const DOMAIN_MAPPING = {
  purpose_alignment: "Purpose Alignment",
  purpose_statement: "Purpose Statement",
  leadership_for_impact: "Leadership for Impact",
  theory_of_change: "Impact focussed theory of change",
  measurement_framework: "Impact Measurement framework",
  status_of_data: "Status of Data",
  systems_capabilities: "System Capabilities",
}

// Get display name for a domain
const getDomainDisplayName = (domain: string): string => {
  return DOMAIN_MAPPING[domain as keyof typeof DOMAIN_MAPPING] || domain
}

// Get all expected domains in order
const EXPECTED_DOMAINS = Object.keys(DOMAIN_MAPPING)

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

  // If no scores exist, show a helpful message
  if (scores.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              No Assessment Scores Found
            </CardTitle>
            <CardDescription className="text-amber-700">
              You have {assessments.length} assessments but no scores have been recorded yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-amber-700">
              <p className="mb-2">
                <strong>Current Status:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {projects.length} total projects ({completedProjects.length} completed)
                </li>
                <li>{assessments.length} assessments created</li>
                <li>{completedAssessments.length} assessments for completed projects</li>
                <li>0 scores recorded in assessment_scores table</li>
              </ul>
            </div>
            <Button asChild variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
              <a href="/projects">
                <FileText className="h-4 w-4 mr-2" />
                Go to Projects
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Show preview of domains */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Performance Overview (Preview)</CardTitle>
            <CardDescription>
              This is what your domain analysis will look like once assessment scores are recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {EXPECTED_DOMAINS.map((domainKey, index) => (
                <div key={index} className="space-y-2 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{getDomainDisplayName(domainKey)}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Not Assessed</Badge>
                        <span className="text-xs text-muted-foreground">0 assessments</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">—</div>
                      <div className="text-xs text-muted-foreground">out of 10</div>
                    </div>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If no scores for completed projects
  if (completedScores.length === 0 && scores.length > 0) {
    return (
      <div className="space-y-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              No Scores for Completed Projects
            </CardTitle>
            <CardDescription className="text-blue-700">
              You have {scores.length} scores but none are for completed projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-blue-700">
              <p className="mb-2">
                <strong>Current Status:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>{completedProjects.length} completed projects</li>
                <li>{scores.length} total scores in database</li>
                <li>0 scores for completed projects</li>
              </ul>
            </div>
            <div className="text-sm text-blue-700">
              <p>
                Domain analysis only shows data for completed projects. Mark projects as completed to see their domain
                analysis.
              </p>
            </div>
            <Button asChild variant="outline" className="border-blue-300 text-blue-800 hover:bg-blue-100">
              <a href="/projects">
                <FileText className="h-4 w-4 mr-2" />
                Manage Projects
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate domain statistics for all expected domains
  const domainStats = EXPECTED_DOMAINS.map((domainKey) => {
    const domainScores = completedScores.filter((score) => score.domain === domainKey)
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
      domainKey,
      domain: getDomainDisplayName(domainKey),
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
          <CardDescription>
            Analysis of your performance across all assessment domains for completed projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Assessment Domains</h3>
              <div className="space-y-4">
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
                        <div className="text-xs text-muted-foreground">out of 10</div>
                      </div>
                    </div>
                    <Progress value={stat.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
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
