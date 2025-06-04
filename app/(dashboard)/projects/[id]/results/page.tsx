import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import AssessmentPolarChart from "@/components/projects/polar-chart"
import DownloadResultsButton from "@/components/projects/download-results-button"
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

// Domain mapping that matches your assessment system
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
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Assessment Results</h1>
        <Card>
          <CardHeader>
            <CardTitle>No Assessment Data</CardTitle>
            <CardDescription>This project does not have any completed assessments yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Complete an assessment to see results here.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get all scores for this assessment
  const { data: scores } = await supabase.from("assessment_scores").select("*").eq("assessment_id", assessment.id)

  // Debug: Get unique domain values from the actual scores
  const uniqueDomains = [...new Set(scores?.map((score) => score.domain) || [])]
  console.log("Unique domains in scores:", uniqueDomains)

  // Create domain mapping based on actual data
  const domainNameMapping: Record<string, string> = {
    purpose_alignment: "Purpose Alignment",
    purpose_statement: "Purpose Statement",
    leadership_for_impact: "Leadership for Impact",
    theory_of_change: "Theory of Change",
    measurement_framework: "Measurement Framework",
    status_of_data: "Status of Data",
    system_capabilities: "System Capabilities",
    // Add any other domains that might exist
  }

  // Calculate domain scores using the actual domains found in the data
  const domainScores = uniqueDomains.map((domainId) => {
    // Find all scores for this domain
    const domainScores = scores?.filter((score) => score.domain === domainId) || []

    // Calculate average score for this domain
    const totalScore = domainScores.reduce((sum, score) => sum + score.score, 0)
    const averageScore = domainScores.length > 0 ? totalScore / domainScores.length : 0

    // Get domain name (use mapping or fallback to ID)
    const domainName =
      domainNameMapping[domainId] || domainId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

    console.log(`Domain ${domainId} (${domainName}):`, {
      scoresCount: domainScores.length,
      averageScore,
      scores: domainScores.map((s) => s.score),
    })

    return {
      id: domainId,
      name: domainName,
      score: averageScore,
      completedQuestions: domainScores.length,
      totalQuestions: domainScores.length > 0 ? domainScores.length : 3, // Use actual count or default to 3
      progress: domainScores.length > 0 ? 100 : 0, // If we have scores, consider it complete
      questionScores: domainScores.map((score) => ({
        question_id: score.question_id || `${domainId}_${score.id}`,
        score: score.score,
        notes: score.notes || "",
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
    <div className="container mx-auto py-10">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{project.name} - Assessment Results</h1>
        <DownloadResultsButton
          projectName={project.name}
          organizationName={project.organization_name || "Unknown Organization"}
          domainScores={domainScores}
          overallScore={overallScore}
        />
      </div>

      {/* Overall score summary */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Overall Assessment Score</CardTitle>
            <div className="text-4xl font-bold">{overallScore.toFixed(1)}</div>
          </div>
          <p className="text-sm text-muted-foreground">Average score across all completed domains (out of 10)</p>
        </CardHeader>
      </Card>

      {/* Chart and Domain Scores */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
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
                  <span className="text-xs text-muted-foreground">{domain.completedQuestions} questions completed</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Additional insights section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

      {/* Debug information - remove in production */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Debug Information</h3>
        <div className="text-xs font-mono overflow-auto max-h-[200px]">
          <p>Assessment ID: {assessment.id}</p>
          <p>Total scores: {scores?.length || 0}</p>
          <p>Unique domains found: {uniqueDomains.join(", ")}</p>
          <p>Domain scores calculated: {domainScores.length}</p>
          {domainScores.map((domain) => (
            <p key={domain.id}>
              {domain.name}: {domain.score.toFixed(1)} ({domain.completedQuestions} questions)
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
