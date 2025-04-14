import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { ProjectHeader } from "@/components/projects/project-header"
import { ResultsOverview } from "@/components/projects/results-overview"
import { DownloadResultsButton } from "@/components/projects/download-results-button"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return notFound()
  }

  // Get the project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, organizations(*)")
    .eq("id", params.id)
    .single()

  if (projectError || !project) {
    console.error("Error fetching project:", projectError)
    return notFound()
  }

  // Try to get scores from assessment_scores table first
  let { data: assessmentScores, error: assessmentScoresError } = await supabase
    .from("assessment_scores")
    .select("*")
    .eq("project_id", params.id)

  // If that fails, try the scores table
  if (assessmentScoresError || !assessmentScores || assessmentScores.length === 0) {
    console.log("No data in assessment_scores table, trying scores table...")
    const { data: scores, error: scoresError } = await supabase.from("scores").select("*").eq("project_id", params.id)

    if (scoresError) {
      console.error("Error fetching scores:", scoresError)
    } else if (scores && scores.length > 0) {
      console.log("Found scores in scores table:", scores.length)
      assessmentScores = scores
    }
  }

  // Process scores by domain
  const domainScores = ASSESSMENT_DOMAINS.map((domain) => {
    // Filter scores for this domain
    const domainScores = (assessmentScores || []).filter(
      (score) => score.domain_id === domain.id || score.domain === domain.id,
    )

    // Calculate average score for this domain
    let totalScore = 0
    let scoredQuestions = 0

    domainScores.forEach((score) => {
      if (score.score !== null && score.score !== undefined) {
        totalScore += Number(score.score)
        scoredQuestions++
      }
    })

    const averageScore = scoredQuestions > 0 ? Math.round((totalScore / scoredQuestions) * 10) / 10 : 0

    // Calculate completion percentage
    const totalQuestions = domain.questions?.length || 1
    const completionPercentage = Math.round((scoredQuestions / totalQuestions) * 100)

    return {
      id: domain.id,
      name: domain.name,
      score: averageScore,
      completion: completionPercentage,
      totalQuestions,
      scoredQuestions,
    }
  })

  return (
    <div className="container mx-auto py-6 space-y-8">
      <ProjectHeader project={project} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assessment Results</h1>
        <DownloadResultsButton project={project} scores={assessmentScores || []} domains={ASSESSMENT_DOMAINS} />
      </div>

      <ResultsOverview domainScores={domainScores.filter((d) => d.scoredQuestions > 0)} projectId={params.id} />

      {domainScores.every((d) => d.scoredQuestions === 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-medium text-amber-800 mb-2">No Assessment Data</h3>
          <p className="text-amber-700">
            You haven't completed any assessment questions yet. Start an assessment to see your results here.
          </p>
        </div>
      )}
    </div>
  )
}
