"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionLayoutProps {
  children: React.ReactNode
  questionNumber: number
  totalQuestions: number
  questionTitle: string
  questionDescription?: string
  domain: string
  onPrevious?: () => void
  onNext?: () => void
  canGoNext?: boolean
  canGoPrevious?: boolean
  className?: string
}

export default function QuestionLayout({
  children,
  questionNumber,
  totalQuestions,
  questionTitle,
  questionDescription,
  domain,
  onPrevious,
  onNext,
  canGoNext = true,
  canGoPrevious = true,
  className,
}: QuestionLayoutProps) {
  return (
    <div className={cn("container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-3xl", className)}>
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{domain}</Badge>
            <div className="text-sm text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl">{questionTitle}</CardTitle>
            {questionDescription && <CardDescription className="text-base">{questionDescription}</CardDescription>}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-6">{children}</div>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious || questionNumber === 1}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={onNext} disabled={!canGoNext}>
              {questionNumber === totalQuestions ? "Complete" : "Next"}
              {questionNumber < totalQuestions && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
