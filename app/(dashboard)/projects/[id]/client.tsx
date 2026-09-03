"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { apiFetch, useSession } from "@/lib/api"
import { useProjectPathParams } from "@/lib/path-params"
import ProjectHeader from "@/components/projects/project-header"
import DomainsList from "@/components/projects/domains-list"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"

export default function ProjectView() {
  const { id } = useProjectPathParams()
  const { session } = useSession()
  const [data, setData] = useState<any | null>(null)
  const [state, setState] = useState<"loading" | "ready" | "notfound">("loading")

  useEffect(() => {
    if (!id) return
    apiFetch(`project.php?id=${encodeURIComponent(id)}`)
      .then((d) => {
        setData(d.project)
        setState("ready")
      })
      .catch(() => setState("notfound"))
  }, [id])

  if (state === "loading") return <p className="text-muted-foreground">Loading…</p>

  if (state === "notfound" || !data) {
    return (
      <div className="container mx-auto py-10 text-center space-y-4">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <p className="text-muted-foreground">This project does not exist or you do not have access to it.</p>
        <Link href="/projects" className="text-primary underline underline-offset-4">
          Back to projects
        </Link>
      </div>
    )
  }

  const project = data
  const assessment = (project.assessments || [])[0]

  if (!assessment) {
    return (
      <div>
        <ProjectHeader project={project} />
        <div className="mt-10 text-center py-12 text-muted-foreground">
          <p>No assessment found for this project yet.</p>
        </div>
      </div>
    )
  }

  const scores = project.scores || []

  const domainScores = ASSESSMENT_DOMAINS.map((domain: any) => {
    const ds = scores.filter((s: any) => s.domain === domain.id)
    const totalQuestions = domain.questionCount || 0
    const completedQuestions = ds.length
    const averageScore = ds.length > 0 ? ds.reduce((sum: number, s: any) => sum + Number(s.score), 0) / ds.length : 0

    return {
      ...domain,
      progress: totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0,
      score: averageScore,
      completedQuestions,
      totalQuestions,
    }
  })

  return (
    <div>
      <ProjectHeader project={project} />
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">Assessment Domains</h2>
        <DomainsList domains={domainScores} projectId={String(project.id)} assessmentId={String(assessment.id)} />
      </div>
    </div>
  )
}
