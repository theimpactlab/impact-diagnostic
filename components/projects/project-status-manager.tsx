"use client"

import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { ChevronDown, CheckCircle, Clock, Pause } from 'lucide-react'

interface ProjectStatusManagerProps {
  projectId: string
  currentStatus: string
  projectName: string
}

const statusConfig = {
  active: {
    label: "Active",
    color: "outline" as const,
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "default" as const,
    icon: CheckCircle,
  },
  on_hold: {
    label: "On Hold",
    color: "secondary" as const,
    icon: Pause,
  },
}

export default function ProjectStatusManager({ projectId, currentStatus, projectName }: ProjectStatusManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [status, setStatus] = useState(currentStatus || "active")
  const { toast } = useToast()

  const handleStatusChange = async (newStatus: "active" | "completed" | "on_hold") => {
    setIsUpdating(true)

    try {
      try {
        await apiFetch(`project.php?id=${encodeURIComponent(projectId)}`, {
          method: "PATCH",
          body: { status: newStatus },
        })
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message || "Failed to update status.",
          variant: "destructive",
        })
        setIsUpdating(false)
        return
      }
      setStatus(newStatus)
      toast({
        title: "Success",
        description: `${projectName} marked as ${statusConfig[newStatus].label.toLowerCase()}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const currentConfig = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
  const CurrentIcon = currentConfig.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isUpdating} className="h-auto p-1">
          <Badge variant={currentConfig.color} className="flex items-center gap-1">
            <CurrentIcon className="h-3 w-3" />
            {currentConfig.label}
            <ChevronDown className="h-3 w-3" />
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => handleStatusChange(key as "active" | "completed" | "on_hold")}
              disabled={isUpdating || key === status}
            >
              <Icon className="h-4 w-4 mr-2" />
              {config.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
