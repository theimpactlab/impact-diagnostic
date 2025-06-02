import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AssessmentFormWrapperProps {
  children: React.ReactNode
  title: string
  description?: string
  currentStep?: number
  totalSteps?: number
  domain?: string
  className?: string
}

export default function AssessmentFormWrapper({
  children,
  title,
  description,
  currentStep,
  totalSteps,
  domain,
  className,
}: AssessmentFormWrapperProps) {
  const progressPercentage = currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0

  return (
    <div className={cn("container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl", className)}>
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{title}</CardTitle>
              {description && <CardDescription className="text-base">{description}</CardDescription>}
            </div>
            {domain && (
              <Badge variant="outline" className="text-sm">
                {domain}
              </Badge>
            )}
          </div>

          {currentStep && totalSteps && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>
                  {currentStep} of {totalSteps}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </div>
  )
}
