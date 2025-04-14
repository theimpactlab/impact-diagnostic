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

  // Get the assessment for this project
  const { data: assessments, error: assessmentError } = await supabase
    .from("assessments")
    .select("*")
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)

  if (assessmentError) {
    console.error("Error fetching assessment:", assessmentError)
  }

  const assessmentId = assessments && assessments.length > 0 ? assessments[0].id : null

  // Try to get scores from assessment_scores table
  let scores = []
  if (assessmentId) {
    const { data: assessmentScores, error: assessmentScoresError } = await supabase
      .from("assessment_scores")
      .select("*")
      .eq("assessment_id", assessmentId)

    if (assessmentScoresError) {
      console.error("Error fetching assessment_scores:", assessmentScoresError)
    } else if (assessmentScores && assessmentScores.length > 0) {
      scores = assessmentScores
    } else {
      // If no data in assessment_scores, try the scores table
      const { data: oldScores, error: oldScoresError } = await supabase
        .from("scores")
        .select("*")
        .eq("assessment_id", assessmentId)

      if (oldScoresError) {
        console.error("Error fetching scores:", oldScoresError)
      } else if (oldScores && oldScores.length > 0) {
        scores = oldScores
      }
    }
  }

  // Process scores by domain
  const domainScores = ASSESSMENT_DOMAINS.map((domain) => {
    // Filter scores for this domain
    const domainScores = scores.filter((score) => score.domain === domain.id || score.domain_id === domain.id)

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
    const totalQuestions = domain.questions?.length || 0
    const completionPercentage = totalQuestions > 0 ? Math.round((scoredQuestions / totalQuestions) * 100) : 0

    return {
      id: domain.id,
      name: domain.name,
      score: averageScore,
      completion: completionPercentage,
      totalQuestions,
      scoredQuestions,
      questionScores: domainScores,
    }
  })

  return (
    <div className="container mx-auto py-6 space-y-8">
      <ProjectHeader project={project} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assessment Results</h1>
        <DownloadResultsButton project={project} domainScores={domainScores.filter((d) => d.scoredQuestions > 0)} />
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
