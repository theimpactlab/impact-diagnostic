import type React from "react"
import { cn } from "@/lib/utils"

interface AssessmentContainerProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export default function AssessmentContainer({ children, className, title, description }: AssessmentContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn("container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl", className)}>
        {(title || description) && (
          <div className="mb-8">
            {title && <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{title}</h1>}
            {description && <p className="text-lg text-gray-600">{description}</p>}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8">{children}</div>
      </div>
    </div>
  )
}
