import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"
import ResultsOverview from "@/components/projects/results-overview"
import DownloadResultsButton from "@/components/projects/download-results-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

interface ResultsPageProps {
  params: {
    id: string
  }
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, organizations(*)")
    .eq("id", params.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Get the latest assessment for this project
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Get all scores for this assessment
  const { data: scores } = await supabase.from("assessment_scores").select("*").eq("assessment_id", assessment.id)

  // Calculate domain scores
  const domainScores = ASSESSMENT_DOMAINS.map((domain) => {
    const domainScores = scores?.filter((score) => score.domain === domain.id) || []
    const totalQuestions = domain.questionCount || 0
    const completedQuestions = domainScores.length
    const averageScore =
      domainScores.length > 0 ? domainScores.reduce((sum, score) => sum + score.score, 0) / domainScores.length : 0

    return {
      id: domain.id,
      name: domain.name,
      score: averageScore,
      completedQuestions,
      totalQuestions,
      progress: totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0,
      questionScores: domainScores.map((score) => ({
        question_id: score.question_id,
        score: score.score,
        notes: score.notes,
      })),
    }
  })

  // Calculate overall score (average of all domain scores)
  const completedDomains = domainScores.filter((domain) => domain.completedQuestions > 0)
  const overallScore =
    completedDomains.length > 0
      ? completedDomains.reduce((sum, domain) => sum + domain.score, 0) / completedDomains.length
      : 0

  // Categorize domains by score (updated for 10-point scale)
  const priorityAreas = domainScores
    .filter((domain) => domain.score > 0 && domain.score < 6.0)
    .sort((a, b) => a.score - b.score)
  const strengths = domainScores.filter((domain) => domain.score >= 8.0).sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-2">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/projects/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
      </div>

      {/* Title and download button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{project.name} - Assessment Results</h1>
        <DownloadResultsButton
          projectName={project.name}
          organizationName={project.organizations?.name || "Unknown Organization"}
          domainScores={domainScores}
          overallScore={overallScore}
        />
      </div>

      {/* Overall score summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Overall Assessment Score</CardTitle>
            <div className="text-4xl font-bold">{overallScore.toFixed(1)}</div>
          </div>
          <p className="text-sm text-muted-foreground">Average score across all completed domains (out of 10)</p>
        </CardHeader>
      </Card>

      {/* Radar chart - full width */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsOverview domainScores={domainScores} overallScore={overallScore} />
        </CardContent>
      </Card>

      {/* Detailed domain scores - separate section */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Domain Scores</CardTitle>
          <p className="text-sm text-muted-foreground">Individual performance across all assessment domains</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {domainScores.map((domain) => (
              <div key={domain.id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{domain.name}</span>
                  <span
                    className={`font-bold ${domain.score < 6 ? "text-red-600" : domain.score >= 8 ? "text-green-600" : ""}`}
                  >
                    {domain.score.toFixed(1)}
                  </span>
                </div>
                <Progress
                  value={domain.score * 10} // Updated for 10-point scale
                  className={`h-2 ${
                    domain.score < 6 ? "bg-red-100" : domain.score >= 8 ? "bg-green-100" : "bg-gray-100"
                  }`}
                  indicatorClassName={`${domain.score < 6 ? "bg-red-500" : domain.score >= 8 ? "bg-green-500" : ""}`}
                />
                <div className="text-xs text-muted-foreground">
                  {domain.completedQuestions}/{domain.totalQuestions} questions completed
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional insights section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Priority areas */}
        {priorityAreas.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Priority Areas</CardTitle>
              <p className="text-sm text-muted-foreground">Domains scoring below 6.0</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorityAreas.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between">
                    <span>{domain.name}</span>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                      {domain.score.toFixed(1)}/10
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-700">Strengths</CardTitle>
              <p className="text-sm text-muted-foreground">Domains scoring 8.0 or above</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {strengths.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between">
                    <span>{domain.name}</span>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      {domain.score.toFixed(1)}/10
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations section */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Immediate Actions</h3>
              <ul className="space-y-2 text-sm">
                {priorityAreas.slice(0, 3).map((domain) => (
                  <li key={domain.id} className="list-disc ml-4">
                    Develop a plan to improve {domain.name.toLowerCase()}
                  </li>
                ))}
                {priorityAreas.length === 0 && (
                  <li className="list-disc ml-4">Continue maintaining your strong performance across domains</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Medium-term Goals</h3>
              <ul className="space-y-2 text-sm">
                <li className="list-disc ml-4">Implement regular assessment reviews</li>
                <li className="list-disc ml-4">Share best practices from high-scoring domains</li>
                <li className="list-disc ml-4">Develop training for middle-scoring domains</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Long-term Strategy</h3>
              <ul className="space-y-2 text-sm">
                <li className="list-disc ml-4">Aim for all domains to score above 8.0</li>
                <li className="list-disc ml-4">Establish a continuous improvement process</li>
                <li className="list-disc ml-4">Consider external validation of your assessment approach</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
