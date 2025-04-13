import Link from "next/link"
import { Calendar, Settings } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"

interface ProjectHeaderProps {
  project: {
    id: string
    name: string
    organization_name: string
    description: string | null
    created_at: string
  }
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-xl text-muted-foreground mt-1">{project.organization_name}</p>
          {project.description && <p className="mt-2 text-muted-foreground max-w-2xl">{project.description}</p>}
        </div>

        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            Created on {format(new Date(project.created_at), "MMMM d, yyyy")}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${project.id}/details`}>
              <Settings className="h-4 w-4 mr-2" />
              Project Details
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
