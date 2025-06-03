"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getProject } from "@/lib/api"
import type { Project } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { calculateDomainScores } from "@/lib/utils"
import AssessmentPolarChart from "@/components/projects/polar-chart"

const ProjectResultsPage = () => {
  const { id } = useParams<{ id: string }>()
  const [domainScores, setDomainScores] = useState<{ [key: string]: number } | null>(null)

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ["project", id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (project) {
      const scores = calculateDomainScores(project)
      setDomainScores(scores)
    }
  }, [project])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (!project) {
    return <div>Project not found.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.title} Results</h1>
        <Badge variant="secondary">{project.status}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Created by {project.creatorName} on {new Date(project.createdAt).toLocaleDateString()}
      </p>
      <Separator />

      {domainScores ? <AssessmentPolarChart domainScores={domainScores} /> : <div>Calculating scores...</div>}
    </div>
  )
}

export default ProjectResultsPage
