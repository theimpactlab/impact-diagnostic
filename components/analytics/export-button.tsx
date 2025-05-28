"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  projects: any[]
  assessments: any[]
  scores: any[]
}

interface ExportButtonProps {
  data: AnalyticsData
}

export default function ExportButton({ data }: ExportButtonProps) {
  const { toast } = useToast()

  const exportToCSV = () => {
    try {
      // Create CSV content
      const csvContent = [
        ["Project Name", "Organization", "Created Date", "Assessments", "Average Score"],
        ...data.projects.map((project) => {
          const projectAssessments = data.assessments.filter((a) => a.project_id === project.id)
          const projectScores = data.scores.filter((s) => projectAssessments.some((a) => a.id === s.assessment_id))
          const averageScore =
            projectScores.length > 0
              ? (projectScores.reduce((sum, s) => sum + s.score, 0) / projectScores.length).toFixed(1)
              : "0"

          return [
            project.name,
            project.organization_name || "Unknown",
            new Date(project.created_at).toLocaleDateString(),
            projectAssessments.length.toString(),
            averageScore,
          ]
        }),
      ]

      const csvString = csvContent.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      // Create and download file
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `analytics-export-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: "Your analytics data has been exported to CSV",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={exportToCSV} variant="outline">
      <Download className="h-4 w-4 mr-2" />
      Export Data
    </Button>
  )
}
