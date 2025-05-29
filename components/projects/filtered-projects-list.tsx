"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Building } from "lucide-react"
import ProjectStatusManager from "@/components/projects/project-status-manager"
import ProjectStatusFilter from "@/components/projects/project-status-filter"

interface Project {
  id: string
  name: string
  description?: string
  organization_name: string
  created_at: string
  status: string
  owner_id: string
}

interface FilteredProjectsListProps {
  projects: Project[]
  showFilter?: boolean
  defaultFilter?: string
}

export default function FilteredProjectsList({
  projects,
  showFilter = false,
  defaultFilter = "active",
}: FilteredProjectsListProps) {
  const [statusFilter, setStatusFilter] = useState(defaultFilter)

  // Calculate project counts for each status
  const projectCounts = useMemo(() => {
    const counts = {
      all: projects.length,
      active: 0,
      completed: 0,
      on_hold: 0,
    }

    projects.forEach((project) => {
      const status = project.status || "active"
      if (status in counts) {
        counts[status as keyof typeof counts]++
      }
    })

    return counts
  }, [projects])

  // Filter projects based on selected status
  const filteredProjects = useMemo(() => {
    if (statusFilter === "all") {
      return projects
    }
    return projects.filter((project) => (project.status || "active") === statusFilter)
  }, [projects, statusFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "on_hold":
        return "secondary"
      case "active":
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {showFilter && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground">Manage and track your impact assessment projects</p>
          </div>
          <ProjectStatusFilter
            currentFilter={statusFilter}
            onFilterChange={setStatusFilter}
            projectCounts={projectCounts}
          />
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">
                {statusFilter === "all" ? "No projects found" : `No ${statusFilter} projects`}
              </h3>
              <p className="text-muted-foreground">
                {statusFilter === "all"
                  ? "Create your first project to get started with impact assessment."
                  : `You don't have any ${statusFilter} projects at the moment.`}
              </p>
              {statusFilter !== "all" && (
                <Button variant="outline" onClick={() => setStatusFilter("all")}>
                  View All Projects
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-3 w-3" />
                      {project.organization_name}
                    </div>
                  </div>
                  <ProjectStatusManager
                    projectId={project.id}
                    currentStatus={project.status || "active"}
                    projectName={project.name}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Created {formatDate(project.created_at)}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={getStatusColor(project.status || "active")}>{project.status || "active"}</Badge>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/projects/${project.id}`}>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
