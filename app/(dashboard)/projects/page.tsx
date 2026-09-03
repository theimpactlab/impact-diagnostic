"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import FilteredProjectsList from "@/components/projects/filtered-projects-list"
import Link from "next/link"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiFetch<{ projects: any[] }>("projects.php")
      .then((d) => setProjects(d.projects || []))
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Projects</CardTitle>
            <CardDescription>There was an error loading your projects. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (projects === null) {
    return (
      <div className="container mx-auto py-10">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage and track all your impact assessment projects</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <FilteredProjectsList projects={projects} showFilter={true} defaultFilter="active" />
    </div>
  )
}
