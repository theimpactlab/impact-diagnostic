import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, Share } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AssessmentResultsWrapperProps {
  children: React.ReactNode
  projectId: string
  projectName: string
  domain: string
  score?: number
  maxScore?: number
  completedAt?: string
  className?: string
}

export default function AssessmentResultsWrapper({
  children,
  projectId,
  projectName,
  domain,
  score,
  maxScore = 5,
  completedAt,
  className,
}: AssessmentResultsWrapperProps) {
  const scorePercentage = score ? (score / maxScore) * 100 : 0

  return (
    <div className={cn("container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl", className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/projects/${projectId}/assessment`}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Assessment
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Results</h1>
            <p className="text-lg text-muted-foreground">{projectName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Score Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">{domain}</Badge>
                  Domain Assessment
                </CardTitle>
                {completedAt && (
                  <CardDescription>Completed on {new Date(completedAt).toLocaleDateString()}</CardDescription>
                )}
              </div>
              {score !== undefined && (
                <div className="text-right space-y-1">
                  <div className="text-3xl font-bold">
                    {score.toFixed(1)}/{maxScore}
                  </div>
                  <Progress value={scorePercentage} className="w-24 h-2" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
