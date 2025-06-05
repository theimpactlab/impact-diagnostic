"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface ScoreVerificationResult {
  domainId: string
  domainName: string
  calculatedScore: number
  storedScore?: number
  discrepancy: number
  hasDiscrepancy: boolean
  completedQuestions: number
  totalQuestions: number
}

export default function ScoreVerificationPanel() {
  const [projectId, setProjectId] = useState("")
  const [results, setResults] = useState<ScoreVerificationResult[]>([])
  const [overallScore, setOverallScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClientComponentClient()

  // Assessment domains (simplified version)
  const ASSESSMENT_DOMAINS = [
    { id: "accessibility", name: "Accessibility", questionCount: 10 },
    { id: "performance", name: "Performance", questionCount: 8 },
    { id: "security", name: "Security", questionCount: 12 },
    // Add other domains as needed
  ]

  async function verifyScores() {
    if (!projectId) {
      setError("Please enter a project ID")
      return
    }

    setIsLoading(true)
    setError("")
    setResults([])
    setOverallScore(null)

    try {
      // Get the latest assessment for this project
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (assessmentError) {
        throw new Error(`Error fetching assessment: ${assessmentError.message}`)
      }

      // Get all scores for this assessment
      const { data: scores, error: scoresError } = await supabase
        .from("assessment_scores")
        .select("*")
        .eq("assessment_id", assessment.id)

      if (scoresError) {
        throw new Error(`Error fetching scores: ${scoresError.message}`)
      }

      // Calculate domain scores
      const verificationResults: ScoreVerificationResult[] = ASSESSMENT_DOMAINS.map((domain) => {
        const domainScores = scores.filter((score) => score.domain === domain.id)
        const totalQuestions = domain.questionCount
        const completedQuestions = domainScores.length

        // Calculate average score
        const totalScore = domainScores.reduce((sum, score) => sum + score.score, 0)
        const calculatedScore = domainScores.length > 0 ? totalScore / domainScores.length : 0

        // For this example, we're assuming the stored score might be in the assessment object
        // Adjust this based on your actual data structure
        const storedScore = assessment[`${domain.id}_score`] || calculatedScore
        const discrepancy = Math.abs(calculatedScore - storedScore)

        return {
          domainId: domain.id,
          domainName: domain.name,
          calculatedScore,
          storedScore,
          discrepancy,
          hasDiscrepancy: discrepancy > 0.01,
          completedQuestions,
          totalQuestions,
        }
      })

      // Calculate overall score
      const completedDomains = verificationResults.filter((domain) => domain.completedQuestions > 0)
      const calculatedOverallScore =
        completedDomains.length > 0
          ? completedDomains.reduce((sum, domain) => sum + domain.calculatedScore, 0) / completedDomains.length
          : 0

      setResults(verificationResults)
      setOverallScore(calculatedOverallScore)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Domain Score Verification</CardTitle>
        <CardDescription>Verify domain score calculations against stored data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <Input placeholder="Enter project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          <Button onClick={verifyScores} disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Scores"}
          </Button>
        </div>

        {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4">{error}</div>}

        {results.length > 0 && (
          <div className="space-y-6">
            <div className="rounded-md border">
              <div className="p-4 bg-muted/50">
                <h3 className="font-medium">Overall Score: {overallScore?.toFixed(2)}</h3>
                <p className="text-sm text-muted-foreground">
                  Based on {results.filter((r) => r.completedQuestions > 0).length}/{results.length} domains with
                  responses
                </p>
              </div>
              <div className="divide-y">
                {results.map((result) => (
                  <div key={result.domainId} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{result.domainName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.completedQuestions}/{result.totalQuestions} questions answered
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{result.calculatedScore.toFixed(2)}</span>
                          {result.hasDiscrepancy ? (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {result.hasDiscrepancy && (
                          <p className="text-xs text-destructive">Discrepancy: {result.discrepancy.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This tool recalculates scores using the formula: Sum of question scores ÷ Number of answered questions
      </CardFooter>
    </Card>
  )
}
