import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import DomainAssessment from "@/components/projects/domain-assessment"
import { ASSESSMENT_DOMAINS, DOMAIN_QUESTIONS } from "@/lib/constants"

export const dynamic = "force-dynamic"

interface DomainPageProps {
  params: {
    id: string
    domain: string
  }
}

export default async function DomainPage({ params }: DomainPageProps) {
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

  // Find the domain
  const domain = ASSESSMENT_DOMAINS.find((d) => d.id === params.domain)
  if (!domain) {
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
    // Create a new assessment if one doesn't exist
    const { data: newAssessment, error: newAssessmentError } = await supabase
      .from("assessments")
      .insert({
        project_id: params.id,
        status: "in_progress",
      })
      .select()
      .single()

    if (newAssessmentError || !newAssessment) {
      console.error("Failed to create assessment:", newAssessmentError)
      notFound()
    }

    const assessment = newAssessment
  }

  // Get existing scores for this domain
  const { data: scores } = await supabase
    .from("assessment_scores")
    .select("*")
    .eq("assessment_id", assessment.id)
    .eq("domain", params.domain)

  // Get questions for this domain
  const questions = DOMAIN_QUESTIONS[params.domain] || []

  // Merge existing scores with questions
  const questionsWithScores = questions.map((question) => {
    const score = scores?.find((s) => s.question_id === question.id)
    return {
      ...question,
      score: score?.score || null,
      notes: score?.notes || "",
    }
  })

  return (
    <DomainAssessment project={project} domain={domain} questions={questionsWithScores} assessmentId={assessment.id} />
  )
}
