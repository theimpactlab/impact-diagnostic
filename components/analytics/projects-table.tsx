import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react'
import ProjectStatusManager from "@/components/projects/project-status-manager"

interface AnalyticsData {
  projects: any[]
  assessments: any[]
  scores: any[]
}

interface ProjectsTableProps {
  data: AnalyticsData
}

export default function ProjectsTable({ data }: ProjectsTableProps) {
  const { projects, assessments, scores } = data

  // Enhance projects with assessment data
  const enhancedProjects = projects.map((project) => {
    const projectAssessments = assessments.filter((a) => a.project_id === project.id)
    const projectScores = scores.filter((s) => projectAssessments.some((a) => a.id === s.assessment_id))

    const averageScore =
      projectScores.length > 0 ? projectScores.reduce((sum, s) => sum + s.score, 0) / projectScores.length : 0

    // Use the actual status from the database, default to 'active' if not set
    const status = project.status || "active"

    return {
      ...project,
      assessmentCount: projectAssessments.length,
      averageScore,
      status,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects Overview</CardTitle>
        <CardDescription>Detailed view of all your projects and their assessment status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enhancedProjects.map((project, index) => (
            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">{project.name}</h4>
                <p className="text-sm text-muted-foreground">{project.organization_name}</p>
                <div className="flex items-center gap-2">
                  <ProjectStatusManager
                    projectId={project.id}
                    currentStatus={project.status}
                    projectName={project.name}
                  />
                  <span className="text-xs text-muted-foreground">
                    {project.assessmentCount} assessment{project.assessmentCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-lg font-semibold">
                  {project.averageScore > 0 ? project.averageScore.toFixed(1) : "—"}
                </div>
                <div className="text-xs text-muted-foreground">avg score</div>
                <Button size="sm" variant="outline">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
          {enhancedProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No projects found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
