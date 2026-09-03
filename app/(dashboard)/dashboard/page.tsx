"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Target, Users } from "lucide-react"
import FilteredProjectsList from "@/components/projects/filtered-projects-list"
import Link from "next/link"

interface Project {
  id: number
  name: string
  description?: string | null
  status: string
  domain?: string | null
  created_at: string
  updated_at?: string
  organization_name?: string | null
  [key: string]: any
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    apiFetch<{ projects: Project[] }>("projects.php")
      .then((d) => setProjects(d.projects || []))
      .catch(() => setError(true))
  }, [])

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load your projects. Please refresh the page.</CardDescription>
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

  const active = projects.filter((p) => p.status === "active" || p.status === "in_progress")
  const totalProjects = projects.length
  const completedProjects = projects.filter((p) => p.status === "completed" || p.status === "complete").length

  const metrics = [
    {
      title: "Active Projects",
      value: active.length,
      description: "Currently in progress",
      icon: Target,
      trend: `${totalProjects} total projects`,
    },
    {
      title: "Completed Projects",
      value: completedProjects,
      description: "Successfully finished",
      icon: TrendingUp,
      trend: `${Math.round((completedProjects / Math.max(totalProjects, 1)) * 100)}% completion rate`,
    },
    {
      title: "Organizations",
      value: new Set(projects.map((p) => p.organization_name).filter(Boolean)).size,
      description: "Unique organizations",
      icon: Users,
      trend: "Across all projects",
    },
  ]

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your active projects.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.description}</p>
                <p className="text-xs text-green-600 mt-1">{metric.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Active Projects</h2>
          <Button variant="outline" asChild>
            <Link href="/projects">View All Projects</Link>
          </Button>
        </div>

        {active.length > 0 ? (
          <FilteredProjectsList projects={active} showFilter={false} defaultFilter="active" />
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-medium">No Active Projects</h3>
                  <p className="text-muted-foreground">
                    You don&apos;t have any active projects. Create your first project to get started.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/projects/new">Create Project</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
