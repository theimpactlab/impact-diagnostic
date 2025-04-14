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
import { Slider } from "@/components/ui/slider"

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
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(
    questions.reduce((acc, q) => {
      // If we have a score for purpose alignment, convert it back to a percentage
      if (q.id === "pa_1" && scores[q.id] !== null) {
        const score = scores[q.id] || 0
        // Convert score back to percentage (middle of range)
        const percentageMap: Record<number, number> = {
          0: 0,
          1: 5, // middle of 1-10
          2: 15, // middle of 11-20
          3: 25, // middle of 21-30
          4: 35, // middle of 31-40
          5: 45, // middle of 41-50
          6: 55, // middle of 51-60
          7: 65, // middle of 61-70
          8: 75, // middle of 71-80
          9: 85, // middle of 81-90
          10: 95, // middle of 91-100
        }
        return { ...acc, [q.id]: percentageMap[score] || 0 }
      }
      return { ...acc, [q.id]: 0 }
    }, {}),
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    questions.reduce((acc, q) => ({ ...acc, [q.id]: q.notes || "" }), {}),
  )
  const [saving, setSaving] = useState(false)

  // Convert percentage to equivalent score for purpose alignment
  const getEquivalentScore = (percentage: number): number => {
    if (percentage === 0) return 0
    if (percentage <= 10) return 1
    if (percentage <= 20) return 2
    if (percentage <= 30) return 3
    if (percentage <= 40) return 4
    if (percentage <= 50) return 5
    if (percentage <= 60) return 6
    if (percentage <= 70) return 7
    if (percentage <= 80) return 8
    if (percentage <= 90) return 9
    return 10
  }

  const handleScoreChange = (questionId: string, score: number, inverted = false) => {
    // If the question is inverted, we store the inverted score in the database
    // but display the original score to the user
    const valueToStore = inverted ? 10 - score : score
    setScores((prev) => ({ ...prev, [questionId]: valueToStore }))
  }

  const handleSliderChange = (questionId: string, value: number[]) => {
    const percentage = value[0]
    setSliderValues((prev) => ({ ...prev, [questionId]: percentage }))

    // Convert percentage to equivalent score
    const equivalentScore = getEquivalentScore(percentage)
    setScores((prev) => ({ ...prev, [questionId]: equivalentScore }))
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

  // Get the label for the current percentage value
  const getPercentageLabel = (percentage: number): string => {
    const score = getEquivalentScore(percentage)
    return `${percentage}% (Score: ${score})`
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
          const isPurposeAlignment = question.id === "pa_1"
          const scoreOptions = question.options || DEFAULT_SCORE_OPTIONS
          const displayScore = getDisplayScore(question.id, question.inverted)
          const sliderValue = sliderValues[question.id] || 0

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
                {isPurposeAlignment ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">0%</span>
                      <span className="text-sm font-medium">100%</span>
                    </div>
                    <Slider
                      value={[sliderValue]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(value) => handleSliderChange(question.id, value)}
                      className="w-full"
                    />
                    <div className="text-center">
                      <span className="text-sm font-medium">Current value: {getPercentageLabel(sliderValue)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>Alignment percentage is converted to a score using this scale:</p>
                      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                        <li>0% = 0</li>
                        <li>1-10% = 1</li>
                        <li>11-20% = 2</li>
                        <li>21-30% = 3</li>
                        <li>31-40% = 4</li>
                        <li>41-50% = 5</li>
                        <li>51-60% = 6</li>
                        <li>61-70% = 7</li>
                        <li>71-80% = 8</li>
                        <li>81-90% = 9</li>
                        <li>91-100% = 10</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
