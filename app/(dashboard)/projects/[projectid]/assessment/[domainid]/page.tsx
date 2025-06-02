"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import QuestionLayout from "@/components/assessment/question-layout"

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

// Sample questions for demonstration
const QUESTIONS = [
  {
    id: "q1",
    title: "How clearly is your organization's purpose defined?",
    description: "Consider whether your purpose is documented and understood by all stakeholders.",
    options: [
      { value: "1", label: "Not defined" },
      { value: "2", label: "Somewhat defined" },
      { value: "3", label: "Defined but not widely understood" },
      { value: "4", label: "Well defined and understood" },
      { value: "5", label: "Exceptionally clear and central to all activities" },
    ],
  },
  {
    id: "q2",
    title: "How well does your impact measurement align with your organizational purpose?",
    description: "Consider the connection between what you measure and your core purpose.",
    options: [
      { value: "1", label: "No alignment" },
      { value: "2", label: "Limited alignment" },
      { value: "3", label: "Moderate alignment" },
      { value: "4", label: "Strong alignment" },
      { value: "5", label: "Perfect alignment throughout" },
    ],
  },
  {
    id: "q3",
    title: "How effectively do you communicate your impact measurement approach to stakeholders?",
    description: "Consider transparency and clarity in reporting impact to different audiences.",
    options: [
      { value: "1", label: "Not communicated" },
      { value: "2", label: "Limited communication" },
      { value: "3", label: "Regular but basic communication" },
      { value: "4", label: "Comprehensive communication" },
      { value: "5", label: "Exemplary, tailored communication to all stakeholders" },
    ],
  },
]

export default function AssessmentQuestionPage({ params }: PageProps) {
  const { projectId, domainId } = params
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { score: string; notes: string }>>({})
  const [projectName, setProjectName] = useState("")
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const currentQuestion = QUESTIONS[currentQuestionIndex]
  const domainName = DOMAIN_NAMES[domainId] || domainId

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Get project name
        const { data: project } = await supabase.from("projects").select("name").eq("id", projectId).single()
        if (project) {
          setProjectName(project.name)
        }

        // Get or create assessment
        const { data: existingAssessment } = await supabase
          .from("assessments")
          .select("id")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (existingAssessment) {
          setAssessmentId(existingAssessment.id)
        } else {
          // Create new assessment if none exists
          const { data: newAssessment, error } = await supabase
            .from("assessments")
            .insert({ project_id: projectId })
            .select("id")
            .single()

          if (error) {
            throw error
          }

          if (newAssessment) {
            setAssessmentId(newAssessment.id)
          }
        }

        // Get existing answers for this domain
        if (assessmentId) {
          const { data: existingAnswers } = await supabase
            .from("assessment_answers")
            .select("question_id, score, notes")
            .eq("assessment_id", assessmentId)
            .eq("domain", domainId)

          if (existingAnswers && existingAnswers.length > 0) {
            const answersMap: Record<string, { score: string; notes: string }> = {}
            existingAnswers.forEach((answer) => {
              answersMap[answer.question_id] = {
                score: answer.score.toString(),
                notes: answer.notes || "",
              }
            })
            setAnswers(answersMap)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load assessment data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId, domainId, supabase, toast, assessmentId])

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        score: value,
        notes: prev[currentQuestion.id]?.notes || "",
      },
    }))
  }

  const handleNotesChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        score: prev[currentQuestion.id]?.score || "",
        notes: value,
      },
    }))
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = async () => {
    // Save current answer
    if (assessmentId && answers[currentQuestion.id]?.score) {
      try {
        const { error } = await supabase.from("assessment_answers").upsert({
          assessment_id: assessmentId,
          domain: domainId,
          question_id: currentQuestion.id,
          score: Number.parseInt(answers[currentQuestion.id].score),
          notes: answers[currentQuestion.id].notes,
        })

        if (error) {
          throw error
        }
      } catch (error) {
        console.error("Error saving answer:", error)
        toast({
          title: "Error",
          description: "Failed to save your answer",
          variant: "destructive",
        })
        return
      }
    }

    // Move to next question or complete
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate average score
      const scores = Object.values(answers).map((a) => Number.parseInt(a.score))
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

      // Save domain score
      if (assessmentId) {
        try {
          await supabase.from("assessment_scores").upsert({
            assessment_id: assessmentId,
            domain: domainId,
            score: averageScore,
          })

          toast({
            title: "Assessment Completed",
            description: `Your ${domainName} assessment has been saved`,
          })

          // Redirect to results
          router.push(`/projects/${projectId}/assessment/${domainId}/results`)
        } catch (error) {
          console.error("Error saving score:", error)
          toast({
            title: "Error",
            description: "Failed to complete assessment",
            variant: "destructive",
          })
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl">
        <div className="text-center">Loading assessment...</div>
      </div>
    )
  }

  const hasCurrentAnswer = !!answers[currentQuestion.id]?.score

  return (
    <QuestionLayout
      questionNumber={currentQuestionIndex + 1}
      totalQuestions={QUESTIONS.length}
      questionTitle={currentQuestion.title}
      questionDescription={currentQuestion.description}
      domain={domainName}
      onPrevious={handlePrevious}
      onNext={handleNext}
      canGoNext={hasCurrentAnswer}
    >
      <RadioGroup
        value={answers[currentQuestion.id]?.score || ""}
        onValueChange={handleAnswerChange}
        className="space-y-3"
      >
        {currentQuestion.options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`option-${option.value}`} />
            <Label htmlFor={`option-${option.value}`} className="text-base">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any comments or context for your answer..."
          value={answers[currentQuestion.id]?.notes || ""}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
    </QuestionLayout>
  )
}
