"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import { DEFAULT_SCORE_OPTIONS } from "@/lib/constants"

interface Question {
  id: string
  question: string
  guidance: string
  score: number | null
  notes: string
  options?: { value: number; label: string }[]
  inverted?: boolean
}

interface DomainAssessmentProps {
  project: {
    id: string
    name: string
  }
  domain: {
    id: string
    name: string
    description: string
  }
  questions: Question[]
  assessmentId: string
}

export default function DomainAssessment({ project, domain, questions, assessmentId }: DomainAssessmentProps) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, number | null>>(
    questions.reduce((acc, q) => ({ ...acc, [q.id]: q.score }), {}),
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    questions.reduce((acc, q) => ({ ...acc, [q.id]: q.notes || "" }), {}),
  )
  const [saving, setSaving] = useState(false)

  const handleScoreChange = (questionId: string, score: number, inverted = false) => {
    // If the question is inverted, we store the inverted score in the database
    // but display the original score to the user
    const valueToStore = inverted ? 10 - score : score
    setScores((prev) => ({ ...prev, [questionId]: valueToStore }))
  }

  const handleNotesChange = (questionId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [questionId]: value }))
  }

  const saveAssessment = async () => {
    setSaving(true)

    try {
      // Prepare data for upsert
      const scoresToSave = questions.map((q) => ({
        assessment_id: assessmentId,
        domain: domain.id,
        question_id: q.id,
        score: scores[q.id] !== null ? scores[q.id] : 0,
        notes: notes[q.id] || null,
      }))

      // Delete existing scores for this domain and assessment
      await supabase.from("assessment_scores").delete().eq("assessment_id", assessmentId).eq("domain", domain.id)

      // Insert new scores
      const { error } = await supabase.from("assessment_scores").insert(scoresToSave)

      if (error) throw error

      toast({
        title: "Assessment saved",
        description: "Your assessment has been saved successfully.",
      })

      // Refresh the page to get updated data
      router.refresh()
    } catch (error: any) {
      console.error("Error saving assessment:", error)
      toast({
        title: "Error saving assessment",
        description: error.message || "An error occurred while saving your assessment.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const calculateProgress = () => {
    const answeredQuestions = Object.values(scores).filter((score) => score !== null).length
    return (answeredQuestions / questions.length) * 100
  }

  // For inverted questions, we need to display the inverted score to the user
  const getDisplayScore = (questionId: string, inverted = false) => {
    const score = scores[questionId]
    if (score === null) return null
    return inverted ? 10 - score : score
  }

  return (
    <div>
      <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent">
        <Link href={`/projects/${project.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Project
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">{domain.name}</h1>
        <p className="text-muted-foreground mt-2">{domain.description}</p>
      </div>

      <div className="space-y-8">
        {questions.map((question, index) => {
          const scoreOptions = question.options || DEFAULT_SCORE_OPTIONS
          const displayScore = getDisplayScore(question.id, question.inverted)

          return (
            <div key={question.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <span className="font-medium text-lg mr-2">{index + 1}.</span>
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-lg">{question.question}</h3>
                      {question.guidance && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                                <HelpCircle className="h-4 w-4" />
                                <span className="sr-only">Guidance</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>{question.guidance}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {scoreOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={displayScore === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleScoreChange(question.id, option.value, question.inverted)}
                      className="w-10 h-10"
                    >
                      {option.value}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {scoreOptions[0].label} to {scoreOptions[scoreOptions.length - 1].label}
                </p>
              </div>

              <div>
                <label htmlFor={`notes-${question.id}`} className="text-sm font-medium">
                  Notes (Optional)
                </label>
                <Textarea
                  id={`notes-${question.id}`}
                  value={notes[question.id] || ""}
                  onChange={(e) => handleNotesChange(question.id, e.target.value)}
                  placeholder="Add any additional context or notes about your assessment..."
                  className="mt-1"
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-muted-foreground">{Math.round(calculateProgress())}% complete</div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push(`/projects/${project.id}`)}>
            Cancel
          </Button>
          <Button onClick={saveAssessment} disabled={saving}>
            {saving ? "Saving..." : "Save Assessment"}
          </Button>
        </div>
      </div>
    </div>
  )
}
