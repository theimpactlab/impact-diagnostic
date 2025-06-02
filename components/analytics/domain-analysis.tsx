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

// Exact domains from your assessment
const ASSESSMENT_DOMAINS = [
  "Purpose Alignment",
  "Purpose Statement",
  "Leadership for Impact",
  "Impact focussed theory of change",
  "impact measurement framework",
  "status of data",
  "system capabilities",
]

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

  // Get unique domains from actual data for debugging
  const actualDomains = Array.from(new Set(scores.map((score) => score.domain))).filter(Boolean)

  console.log("Debug - Actual domains found:", actualDomains)
  console.log("Debug - Total scores:", scores.length)
  console.log("Debug - Completed scores:", completedScores.length)

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
              {ASSESSMENT_DOMAINS.map((domain, index) => (
                <div key={index} className="space-y-2 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">{domain}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Not Assessed</Badge>
                        <span className="text-xs text-muted-foreground">0 assessments</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">—</div>
                      <div className="text-xs text-muted-foreground">out of 5</div>
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

  // Show debug info if we have scores
  if (actualDomains.length > 0) {
    return (
      <div className="space-y-6">
        {/* Debug info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Debug: Domains Found in Database</CardTitle>
            <CardDescription className="text-blue-600">
              Found {scores.length} total scores ({completedScores.length} for completed projects)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong className="text-blue-800">Actual Domains in assessment_scores table:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {actualDomains.map((domain, index) => (
                    <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                      "{domain}"
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <strong className="text-blue-800">Expected Domains:</strong>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ASSESSMENT_DOMAINS.map((domain, index) => (
                    <Badge key={index} variant="outline" className="text-blue-700 border-blue-300">
                      "{domain}"
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domain Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Domain Performance Overview</CardTitle>
            <CardDescription>
              Analysis of your performance across assessment domains for completed projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Use actual domains from database */}
              <div>
                <h3 className="text-lg font-medium mb-4">Assessment Domains (From Database)</h3>
                <div className="space-y-4">
                  {actualDomains.map((domain, index) => {
                    const domainScores = completedScores.filter((score) => score.domain === domain)
                    const averageScore =
                      domainScores.length > 0
                        ? domainScores.reduce((sum, s) => sum + s.score, 0) / domainScores.length
                        : 0

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

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">{domain}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant={color as any}>{performance}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {domainScores.length} assessment{domainScores.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{averageScore > 0 ? averageScore.toFixed(1) : "—"}</div>
                            <div className="text-xs text-muted-foreground">out of 5</div>
                          </div>
                        </div>
                        <Progress value={(averageScore / 5) * 100} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Show expected domains that are missing */}
              {ASSESSMENT_DOMAINS.filter((domain) => !actualDomains.includes(domain)).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Expected Domains Not Found</h3>
                  <div className="space-y-2">
                    {ASSESSMENT_DOMAINS.filter((domain) => !actualDomains.includes(domain)).map((domain, index) => (
                      <div key={index} className="flex items-center justify-between opacity-50">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">{domain}</h4>
                          <Badge variant="secondary">Not Found in Database</Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">—</div>
                          <div className="text-xs text-muted-foreground">out of 5</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fallback if no domains found
  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Analysis</CardTitle>
        <CardDescription>No domain data available</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">No assessment scores found in the database.</p>
      </CardContent>
    </Card>
  )
}
