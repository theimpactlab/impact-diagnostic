import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DownloadResultsButton from "@/components/projects/download-results-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export const dynamic = "force-dynamic"

interface ResultsPageProps {
  params: {
    id: string
  }
}

// Domain mapping
const DOMAIN_NAMES: Record<string, string> = {
  purpose_alignment: "Purpose Alignment",
  purpose_statement: "Purpose Statement",
  leadership_for_impact: "Leadership for Impact",
  theory_of_change: "Theory of Change",
  measurement_framework: "Measurement Framework",
  status_of_data: "Status of Data",
  system_capabilities: "System Capabilities",
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

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
  const { data: assessment } = await supabase
    .from("assessments")
    .select("*")
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (!assessment) {
    notFound()
  }

  // Get all scores for this assessment
  const { data: scores } = await supabase.from("assessment_scores").select("*").eq("assessment_id", assessment.id)

  // Get all answers for detailed data
  const { data: answers } = await supabase.from("assessment_answers").select("*").eq("assessment_id", assessment.id)

  // Calculate domain scores
  const domainScores = Object.entries(DOMAIN_NAMES).map(([domainId, domainName]) => {
    const domainScore = scores?.find((score) => score.domain === domainId)
    const domainAnswers = answers?.filter((answer) => answer.domain === domainId) || []

    return {
      id: domainId,
      name: domainName,
      score: domainScore?.score || 0,
      completedQuestions: domainAnswers.length,
      totalQuestions: 3, // Assuming 3 questions per domain
      progress: domainAnswers.length > 0 ? 100 : 0,
      questionScores: domainAnswers.map((answer) => ({
        question_id: answer.question_id,
        score: answer.score,
        notes: answer.notes,
      })),
    }
  })

  // Calculate overall score
  const completedDomains = domainScores.filter((domain) => domain.score > 0)
  const overallScore =
    completedDomains.length > 0
      ? completedDomains.reduce((sum, domain) => sum + domain.score, 0) / completedDomains.length
      : 0

  // Categorize domains by score
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
          organizationName={project.organization_name || "Unknown Organization"}
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

      {/* Domain Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Domain Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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
                    {domain.completedQuestions}/{domain.totalQuestions} questions completed
                  </span>
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
