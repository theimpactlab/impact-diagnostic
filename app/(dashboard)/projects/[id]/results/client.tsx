"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { useProjectPathParams } from "@/lib/path-params"
import EnhancedResultsOverview from "@/components/projects/enhanced-results-overview"
import NotesSection from "@/components/projects/notes-section"
import NotesExportButton from "@/components/projects/notes-export-button"
import DownloadResultsButton from "@/components/projects/download-results-button"
import { ASSESSMENT_DOMAINS, DOMAIN_QUESTIONS } from "@/lib/constants"

export default function ResultsView() {
  const { id, ready } = useProjectPathParams()
  const [data, setData] = useState<any | null>(null)
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading")

  useEffect(() => {
    if (!ready || !id) return
    ;(async () => {
      try {
        const d = await apiFetch(`project.php?id=${encodeURIComponent(id)}`)
        const project = d.project
        const assessment = (project.assessments || [])[0]
        if (!assessment) {
          setData({ project })
          setState("ready")
          return
        }
        const sc = await apiFetch<{ scores: any[] }>(`scores.php?assessment_id=${assessment.id}`)
        setData({ project, assessment, scores: sc.scores || [] })
        setState("ready")
      } catch {
        setState("notfound")
      }
    })()
  }, [ready, id])

  if (state === "loading") return <p className="text-muted-foreground">Loading…</p>
  if (state === "notfound" || !data) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold">Results not found</h1>
      </div>
    )
  }

  const { project, assessment, scores } = data

  const domainScores = ASSESSMENT_DOMAINS.map((domain: any) => {
    const ds = (scores || []).filter((s: any) => s.domain === domain.id)
    const questionScores = ((DOMAIN_QUESTIONS as Record<string, any[]>)[domain.id] || []).map((q: any) => {
      const s = ds.find((row: any) => row.question_id === q.id)
      return { ...q, question_id: q.id, score: s ? Number(s.score) : null, notes: s?.notes || "" }
    })
    const answered = questionScores.filter((q) => q.score !== null && q.score !== undefined)
    const avg = answered.length ? answered.reduce((sum, q) => sum + (q.score || 0), 0) / answered.length : 0
    return {
      id: domain.id,
      name: domain.name,
      description: domain.description,
      score: avg,
      progress: (domain.questionCount || questionScores.length) > 0 ? (answered.length / (domain.questionCount || questionScores.length)) * 100 : 0,
      totalQuestions: domain.questionCount || questionScores.length,
      completedQuestions: answered.length,
      questionScores,
    }
  })

  const answeredDomains = domainScores.filter((d) => d.completedQuestions > 0)
  const overallScore = answeredDomains.length
    ? Math.round((answeredDomains.reduce((sum, d) => sum + d.score, 0) / answeredDomains.length) * 10) / 10
    : 0

  const domainNotes = domainScores.map((domain) => ({
    domainId: domain.id,
    domainName: domain.name,
    notes: domain.questionScores
      .filter((q) => q.notes && q.notes.trim() !== "")
      .map((q) => ({
        question_id: q.question_id,
        domain: domain.id,
        score: q.score,
        notes: q.notes || "",
      })),
    totalNotes: domain.questionScores.filter((q) => q.notes && q.notes.trim() !== "").length,
  }))

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{project.name} - Assessment Results</h1>
        <div className="flex gap-2">
          <NotesExportButton
            projectName={project.name}
            organizationName={project.organization_name || "Unknown Organization"}
            domainNotes={domainNotes}
          />
          <DownloadResultsButton
            projectName={project.name}
            organizationName={project.organization_name || "Unknown Organization"}
            domainScores={domainScores}
            overallScore={overallScore}
          />
        </div>
      </div>

      {!assessment || !scores || scores.length === 0 ? (
        <div className="mt-10 text-center py-12 text-muted-foreground">
          <p>No scores have been recorded for this project yet.</p>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          <EnhancedResultsOverview domainScores={domainScores} overallScore={overallScore} />
          <NotesSection domainNotes={domainNotes} />
        </div>
      )}
    </div>
  )
}
