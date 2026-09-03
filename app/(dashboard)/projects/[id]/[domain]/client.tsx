"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { useProjectPathParams } from "@/lib/path-params"
import DomainAssessment from "@/components/projects/domain-assessment"
import { ASSESSMENT_DOMAINS, DOMAIN_QUESTIONS } from "@/lib/constants"

export default function DomainView() {
  const { id, domain: domainId, ready } = useProjectPathParams()
  const [data, setData] = useState<any | null>(null)
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading")

  useEffect(() => {
    if (!ready || !id) return
    let cancelled = false
    ;(async () => {
      try {
        const d = await apiFetch(`project.php?id=${encodeURIComponent(id)}`)
        const project = d.project
        if (cancelled) return

        let assessment = (project.assessments || [])[0]
        if (!assessment) {
          const created = await apiFetch("assessments.php", {
            body: { project_id: Number(id) },
          })
          assessment = created.assessment
        }
        if (cancelled) return

        const sc = await apiFetch<{ scores: any[] }>(
          `scores.php?assessment_id=${encodeURIComponent(assessment.id)}`
        )
        if (cancelled) return

        const scores = (sc.scores || []).filter((s) => s.domain === domainId)
        setData({ project, assessment, scores })
        setState("ready")
      } catch {
        if (!cancelled) setState("notfound")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, id, domainId])

  if (state === "loading") return <p className="text-muted-foreground">Loading…</p>

  const domain = ASSESSMENT_DOMAINS.find((d: any) => d.id === domainId)

  if (state === "notfound" || !data || !domain) {
    return (
      <div className="container mx-auto py-10 text-center space-y-4">
        <h1 className="text-2xl font-bold">Not found</h1>
        <p className="text-muted-foreground">This project or domain could not be loaded.</p>
      </div>
    )
  }

  const questions = (DOMAIN_QUESTIONS as Record<string, any[]>)[domainId as string] || []
  const questionsWithScores = questions.map((question: any) => {
    const score = data.scores.find((s: any) => s.question_id === question.id)
    return {
      ...question,
      score: score ? Number(score.score) : null,
      notes: score?.notes || "",
    }
  })

  return (
    <DomainAssessment
      project={data.project}
      domain={domain}
      questions={questionsWithScores}
      assessmentId={String(data.assessment.id)}
    />
  )
}
