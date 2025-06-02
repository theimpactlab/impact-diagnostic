import type React from "react"
import { cn } from "@/lib/utils"

interface AssessmentPageWrapperProps {
  children: React.ReactNode
  variant?: "default" | "narrow" | "wide"
  className?: string
}

export default function AssessmentPageWrapper({
  children,
  variant = "default",
  className,
}: AssessmentPageWrapperProps) {
  const containerClasses = {
    default: "max-w-4xl",
    narrow: "max-w-3xl",
    wide: "max-w-6xl",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn("container mx-auto py-8 px-4 sm:px-6 lg:px-8", containerClasses[variant], className)}>
        {children}
      </div>
    </div>
  )
}
