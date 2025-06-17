import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import AssessmentPolarChart from "@/components/projects/polar-chart"
import DownloadResultsButton from "@/components/projects/download-results-button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

interface ResultsPageProps {
  params: {
    id: string
  }
}

// Centralized domain mapping
const DOMAIN_NAMES: Record<string, string> = {
  purpose_alignment: "Purpose Alignment",
  purpose_statement: "Purpose Statement",
  leadership_for_impact: "Leadership for Impact",
  theory_of_change: "Theory of Change",
  measurement_framework: "Measurement Framework",
  status_of_data: "Status of Data",
  system_capabilities: "System Capabilities",
}

// Helper function to get score category
function getScoreCategory(score: number): {
  label: string
  variant: "default" | "secondary" | "outline" | "destructive"
  color: string
} {
  if (score >= 8) return { label: "Excellent", variant: "default", color: "text-green-600" }
  if (score >= 6) return { label: "Good", variant: "secondary", color: "text-blue-600" }
  if (score >= 4) return { label: "Fair", variant: "outline", color: "text-yellow-600" }
  if (score > 0) return { label: "Priority", variant: "destructive", color: "text-red-600" }
  return { label: "Not Assessed", variant: "outline", color: "text-gray-500" }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get project details
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", params.id)
      .single()

    if (projectError || !project) {
      notFound()
    }

    // Get the latest assessment for this project
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select("*")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (assessmentError || !assessment) {
      return (
        <div className="container mx-auto py-10">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/projects/${params.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Link>
            </Button>
          </div>

          <h1 className="text-2xl font-bold mb-6">Assessment Results</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                No Assessment Data
              </CardTitle>
              <CardDescription>This project does not have any completed assessments yet.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Complete an assessment to see results here.</p>
              <Button asChild>
                <Link href={`/projects/${params.id}/assessment`}>Start Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Get all scores for this assessment
    const { data: scores, error: scoresError } = await supabase
      .from("assessment_scores")
      .select("*")
      .eq("assessment_id", assessment.id)

    if (scoresError) {
      throw new Error("Failed to fetch assessment scores")
    }

    const uniqueDomains = [...new Set(scores?.map((score) => score.domain) || [])]

    // Calculate domain scores
    const domainScores = uniqueDomains.map((domainId) => {
      const domainScores = scores?.filter((score) => score.domain === domainId) || []
      const totalScore = domainScores.reduce((sum, score) => sum + score.score, 0)
      const averageScore = domainScores.length > 0 ? totalScore / domainScores.length : 0

      const domainName = DOMAIN_NAMES[domainId] || domainId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

      return {
        id: domainId,
        name: domainName,
        score: averageScore,
        completedQuestions: domainScores.length,
        totalQuestions: domainScores.length > 0 ? domainScores.length : 3,
        progress: domainScores.length > 0 ? 100 : 0,
        questionScores: domainScores.map((score) => ({
          question_id: score.question_id || `${domainId}_${score.id}`,
          score: score.score,
          notes: score.notes || "",
        })),
      }
    })

    // Calculate statistics
    const completedDomains = domainScores.filter((domain) => domain.score > 0)
    const overallScore =
      completedDomains.length > 0
        ? completedDomains.reduce((sum, domain) => sum + domain.score, 0) / completedDomains.length
        : 0

    const priorityAreas = domainScores
      .filter((domain) => domain.score > 0 && domain.score < 6.0)
      .sort((a, b) => a.score - b.score)

    const strengths = domainScores.filter((domain) => domain.score >= 8.0).sort((a, b) => b.score - a.score)

    const improvementAreas = domainScores
      .filter((domain) => domain.score >= 6.0 && domain.score < 8.0)
      .sort((a, b) => b.score - a.score)

    return (
      <div className="container mx-auto py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/projects/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Link>
          </Button>
        </div>

        {/* Title and download */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Assessment Results</p>
          </div>
          <DownloadResultsButton
            projectName={project.name}
            organizationName={project.organization_name || "Unknown Organization"}
            domainScores={domainScores}
            overallScore={overallScore}
          />
        </div>

        {/* Overall Score Card */}
        <Card className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Overall Assessment Score
                </CardTitle>
                <CardDescription>
                  Average across {completedDomains.length} completed domain{completedDomains.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{overallScore.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">out of 10</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(overallScore / 10) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Chart and Domain Scores */}
        <div className="space-y-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Overview</CardTitle>
              <CardDescription>Visual representation of your scores across all domains</CardDescription>
            </CardHeader>
            <CardContent>
              <AssessmentPolarChart domainScores={domainScores} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Scores</CardTitle>
              <CardDescription>Performance across assessment areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {domainScores.map((domain) => (
                <div key={domain.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{domain.name}</h4>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{domain.score > 0 ? domain.score.toFixed(1) : "—"}</div>
                      <div className="text-xs text-muted-foreground">out of 10</div>
                    </div>
                  </div>
                  {domain.score > 0 && <Progress value={(domain.score / 10) * 100} className="h-2" />}
                  <div className="flex items-center gap-2">
                    <Badge variant={domain.score >= 8 ? "default" : domain.score >= 6 ? "secondary" : "outline"}>
                      {domain.score >= 8
                        ? "Strength"
                        : domain.score >= 6
                          ? "Good"
                          : domain.score > 0
                            ? "Priority"
                            : "Not Assessed"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {domain.completedQuestions} questions completed
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Strengths */}
          {strengths.length > 0 && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Strengths
                </CardTitle>
                <CardDescription>Domains scoring 8.0 or above</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {strengths.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{domain.name}</span>
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-100">
                        {domain.score.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Improvement Areas */}
          {improvementAreas.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Good Performance
                </CardTitle>
                <CardDescription>Domains scoring 6.0 - 7.9</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {improvementAreas.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{domain.name}</span>
                      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-100">
                        {domain.score.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priority Areas */}
          {priorityAreas.length > 0 && (
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Priority Areas
                </CardTitle>
                <CardDescription>Domains scoring below 6.0</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {priorityAreas.map((domain) => (
                    <div key={domain.id} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{domain.name}</span>
                      <Badge variant="outline" className="text-red-600 border-red-200 bg-red-100">
                        {domain.score.toFixed(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Actions</CardTitle>
            <CardDescription>Strategic recommendations based on your assessment results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-3 text-red-700">Immediate Actions</h3>
                <ul className="space-y-2 text-sm">
                  {priorityAreas.length > 0 ? (
                    priorityAreas.slice(0, 3).map((domain) => (
                      <li key={domain.id} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                        <span>Develop improvement plan for {domain.name.toLowerCase()}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                      <span>Continue maintaining strong performance across all domains</span>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-blue-700">Medium-term Goals</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>Implement regular assessment reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>Share best practices from high-scoring domains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <span>Develop training for middle-scoring domains</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-green-700">Long-term Strategy</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Aim for all domains to score above 8.0</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Establish continuous improvement process</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <span>Consider external validation of assessment approach</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error loading results:", error)
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading the assessment results. Please try again later.</p>
            <Button asChild className="mt-4">
              <Link href={`/projects/${params.id}`}>Back to Project</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}
