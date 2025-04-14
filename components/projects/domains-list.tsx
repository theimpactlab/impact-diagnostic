"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"
import { CheckCircle, ChevronRight, Clock } from "lucide-react"

interface DomainsListProps {
  projectId: string
  scores: any[]
}

export function DomainsList({ projectId, scores = [] }: DomainsListProps) {
  const [domainProgress, setDomainProgress] = useState<Record<string, number>>({})
  const [overallProgress, setOverallProgress] = useState(0)
  const [assessmentStarted, setAssessmentStarted] = useState(false)

  // Calculate progress for each domain based on scores
  useEffect(() => {
    if (!scores || scores.length === 0) {
      setDomainProgress({})
      setOverallProgress(0)
      setAssessmentStarted(false)
      return
    }

    setAssessmentStarted(true)

    // Group scores by domain
    const scoresByDomain: Record<string, any[]> = {}

    scores.forEach((score) => {
      const domainId = score.domain_id || score.domain
      if (!domainId) return

      if (!scoresByDomain[domainId]) {
        scoresByDomain[domainId] = []
      }
      scoresByDomain[domainId].push(score)
    })

    // Calculate progress for each domain
    const progress: Record<string, number> = {}
    let totalQuestions = 0
    let answeredQuestions = 0

    ASSESSMENT_DOMAINS.forEach((domain) => {
      const domainScores = scoresByDomain[domain.id] || []
      const domainQuestions = domain.questionCount || 2 // Default to 2 if not specified

      // Count questions with scores
      const answeredDomainQuestions = domainScores.filter(
        (score) => score.score !== null && score.score !== undefined,
      ).length

      // Calculate domain progress
      const domainProgress = domainQuestions > 0 ? Math.round((answeredDomainQuestions / domainQuestions) * 100) : 0

      progress[domain.id] = domainProgress

      // Add to totals for overall progress
      totalQuestions += domainQuestions
      answeredQuestions += answeredDomainQuestions
    })

    setDomainProgress(progress)

    // Calculate overall progress
    const overall = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0
    setOverallProgress(overall)
  }, [scores])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
          <CardDescription>Track your progress through the impact assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span className="font-medium">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardContent>
        <CardFooter>
          {assessmentStarted && overallProgress > 0 && (
            <Link href={`/projects/${projectId}/results`} className="w-full">
              <Button variant="outline" className="w-full">
                View Results
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ASSESSMENT_DOMAINS.map((domain) => {
          const progress = domainProgress[domain.id] || 0
          const isComplete = progress === 100

          // Find assessment ID from scores
          const domainScores = scores.filter((s) => s.domain_id === domain.id || s.domain === domain.id)
          const assessmentId = domainScores.length > 0 ? domainScores[0].assessment_id : "new"

          return (
            <Card key={domain.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{domain.name}</CardTitle>
                <CardDescription>{domain.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Link href={`/projects/${projectId}/${domain.id}?assessment=${assessmentId}`} className="w-full">
                  <Button variant={isComplete ? "outline" : "default"} className="w-full">
                    {isComplete ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Review Assessment
                      </>
                    ) : progress > 0 ? (
                      <>
                        <Clock className="mr-2 h-4 w-4" />
                        Continue Assessment
                      </>
                    ) : (
                      <>
                        <ChevronRight className="mr-2 h-4 w-4" />
                        Start Assessment
                      </>
                    )}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
