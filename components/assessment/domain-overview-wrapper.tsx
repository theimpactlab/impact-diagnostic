import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface DomainOverviewWrapperProps {
  children: React.ReactNode
  projectId: string
  projectName: string
  totalDomains?: number
  completedDomains?: number
  className?: string
}

export default function DomainOverviewWrapper({
  children,
  projectId,
  projectName,
  totalDomains,
  completedDomains,
  className,
}: DomainOverviewWrapperProps) {
  return (
    <div className={cn("container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/projects/${projectId}`}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Project
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Domains</h1>
            <p className="text-lg text-muted-foreground">{projectName}</p>
          </div>
          {totalDomains && completedDomains !== undefined && (
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold">
                {completedDomains}/{totalDomains}
              </div>
              <div className="text-sm text-muted-foreground">Domains Completed</div>
              <Badge variant={completedDomains === totalDomains ? "default" : "secondary"}>
                {completedDomains === totalDomains ? "Complete" : "In Progress"}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assessment Domains
            </CardTitle>
            <CardDescription>
              Complete each domain assessment to build your comprehensive impact measurement capability profile.
            </CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
