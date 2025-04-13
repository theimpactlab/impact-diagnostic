import Link from "next/link"
import { ChevronLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Project {
  id: string
  name: string
  description: string | null
  created_at: string
}

interface ProjectHeaderProps {
  project: Project
}

export default function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <div className="flex items-center space-x-2">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
        </div>
        {project.description && <p className="text-muted-foreground">{project.description}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Link href={`/projects/${project.id}/results`}>
          <Button variant="outline" size="sm" className="h-8">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Results
          </Button>
        </Link>
      </div>
    </div>
  )
}
