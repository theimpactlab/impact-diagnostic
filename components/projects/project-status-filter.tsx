"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Filter, CheckCircle, Clock, Pause, List } from "lucide-react"

interface ProjectStatusFilterProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
  projectCounts: {
    all: number
    active: number
    completed: number
    on_hold: number
  }
}

const filterOptions = [
  {
    value: "all",
    label: "All Projects",
    icon: List,
    description: "Show all projects regardless of status",
  },
  {
    value: "active",
    label: "Active",
    icon: Clock,
    description: "Currently active projects",
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle,
    description: "Finished projects",
  },
  {
    value: "on_hold",
    label: "On Hold",
    icon: Pause,
    description: "Paused projects",
  },
]

export default function ProjectStatusFilter({
  currentFilter,
  onFilterChange,
  projectCounts,
}: ProjectStatusFilterProps) {
  const currentOption = filterOptions.find((option) => option.value === currentFilter) || filterOptions[0]
  const CurrentIcon = currentOption.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <CurrentIcon className="h-4 w-4" />
          {currentOption.label}
          <Badge variant="secondary" className="ml-1">
            {projectCounts[currentFilter as keyof typeof projectCounts]}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {filterOptions.map((option, index) => {
          const Icon = option.icon
          const count = projectCounts[option.value as keyof typeof projectCounts]
          const isSelected = currentFilter === option.value

          return (
            <div key={option.value}>
              <DropdownMenuItem
                onClick={() => onFilterChange(option.value)}
                className={`flex items-center justify-between ${isSelected ? "bg-accent" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </div>
                <Badge variant={isSelected ? "default" : "secondary"}>{count}</Badge>
              </DropdownMenuItem>
              {index < filterOptions.length - 1 && <DropdownMenuSeparator />}
            </div>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
