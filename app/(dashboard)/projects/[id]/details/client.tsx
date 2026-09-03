"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { useProjectPathParams } from "@/lib/path-params"
import ProjectDetailsForm from "@/components/projects/project-details-form"

export default function DetailsView() {
  const { id, ready } = useProjectPathParams()
  const [project, setProject] = useState<any | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!ready || !id) return
    apiFetch(`project.php?id=${encodeURIComponent(id)}`)
      .then((d) => setProject(d.project))
      .catch(() => setNotFound(true))
  }, [ready, id])

  if (notFound) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
      </div>
    )
  }

  if (!project) return <p className="text-muted-foreground">Loading…</p>

  return <ProjectDetailsForm project={project} />
}
