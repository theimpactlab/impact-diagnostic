import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Project {
  id: string
  name: string
  description: string | null
  organization_name: string
  created_at: string
}

interface ProjectsListProps {
  projects: Project[]
}

export default function ProjectsList({ projects }: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <PlusCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">No projects yet</h3>
        <p className="text-muted-foreground mt-2 mb-6 max-w-md">
          Create your first impact assessment project to get started.
        </p>
        <Button asChild>
          <Link href="/projects/new">Create Project</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">{project.name}</CardTitle>
            <CardDescription>{project.organization_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description || "No description provided"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
            <p className="text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </p>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/projects/${project.id}`}>View</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
