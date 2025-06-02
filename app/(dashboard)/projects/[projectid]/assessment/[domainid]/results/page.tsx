import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AssessmentResultsWrapper from "@/components/assessment/assessment-results-wrapper"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    projectId: string
    domainId: string
  }
}

// Domain display names
const DOMAIN_NAMES: Record<string, string> = {
  purpose_alignment: "Purpose Alignment",
  purpose_statement: "Purpose Statement",
  leadership_for_impact: "Leadership for Impact",
  theory_of_change: "Theory of Change",
  measurement_framework: "Measurement Framework",
  status_of_data: "Status of Data",
  system_capabilities: "System Capabilities",
}

// Sample recommendations based on score ranges
const getRecommendations = (score: number): string[] => {
  if (score < 2) {
    return [
      "Develop a clear written statement of purpose that explicitly includes impact",
      "Engage leadership in workshops to better understand impact measurement",
      "Begin documenting basic impact metrics aligned with your purpose",
    ]
  } else if (score < 3.5) {
    return [
      "Refine your impact measurement framework to better align with organizational purpose",
      "Implement regular impact reporting to leadership and stakeholders",
      "Develop a more comprehensive theory of change with clear outcomes",
    ]
  } else {
    return [
      "Share your impact measurement approach as a best practice with peers",
      "Consider external validation or certification of your impact measurement",
      "Integrate impact metrics into strategic decision-making processes",
    ]
  }
}

// Get score description
const getScoreDescription = (score: number): string => {
  if (score < 2) {
    return "Beginning stage - significant opportunity for improvement"
  } else if (score < 3) {
    return "Developing stage - building foundations for effective impact measurement"
  } else if (score < 4) {
    return "Established stage - solid impact measurement practices in place"
  } else {
    return "Leading stage - exemplary impact measurement aligned with purpose"
  }
}

export default async function AssessmentResultsPage({ params }: PageProps) {
  const { projectId, domainId } = params
  const supabase = createServerComponentClient({ cookies })

  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    notFound()
  }

  // Get project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Get assessment for this project
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (assessmentError || !assessment) {
    notFound()
  }

  // Get domain score
  const { data: scoreData, error: scoreError } = await supabase
    .from("assessment_scores")
    .select("score, created_at")
    .eq("assessment_id", assessment.id)
    .eq("domain", domainId)
    .single()

  if (scoreError || !scoreData) {
    notFound()
  }

  // Get answers for this domain
  const { data: answers, error: answersError } = await supabase
    .from("assessment_answers")
    .select("question_id, score, notes")
    .eq("assessment_id", assessment.id)
    .eq("domain", domainId)

  const domainName = DOMAIN_NAMES[domainId] || domainId
  const score = scoreData.score
  const recommendations = getRecommendations(score)
  const scoreDescription = getScoreDescription(score)

  return (
    <AssessmentResultsWrapper
      projectId={projectId}
      projectName={project.name}
      domain={domainName}
      score={score}
      completedAt={scoreData.created_at}
    >
      <div className="space-y-8">
        {/* Score Summary */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Score Summary</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700">{scoreDescription}</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Recommendations</h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">
                  {index + 1}
                </span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detailed Responses */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Responses</h3>
          <div className="space-y-4">
            {answers?.map((answer) => (
              <Card key={answer.question_id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">Question {answer.question_id}</CardTitle>
                    <Badge>{answer.score}/5</Badge>
                  </div>
                </CardHeader>
                {answer.notes && (
                  <CardContent>
                    <CardDescription className="text-sm">{answer.notes}</CardDescription>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AssessmentResultsWrapper>
  )
}
