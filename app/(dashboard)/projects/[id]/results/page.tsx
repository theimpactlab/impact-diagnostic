import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"
import ResultsOverview from "@/components/projects/results-overview"
import DownloadResultsButton from "@/components/projects/download-results-button"

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{project.name} - Assessment Results</h1>
        <DownloadResultsButton
          projectName={project.name}
          organizationName={project.organizations?.name || "Unknown Organization"}
          domainScores={domainScores}
          overallScore={overallScore}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <ResultsOverview domainScores={domainScores} overallScore={overallScore} />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-6">Detailed Domain Scores</h2>
        <div className="space-y-6">
          {domainScores.map((domain) => (
            <div key={domain.id} className="border-b pb-4 last:border-b-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-medium">{domain.name}</h3>
                <span className="text-2xl font-bold">{domain.score.toFixed(1)}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {domain.completedQuestions} of {domain.totalQuestions} questions answered ({Math.round(domain.progress)}
                % complete)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
