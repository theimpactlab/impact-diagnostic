"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DomainScore {
  id: string
  name: string
  score: number
  completedQuestions: number
  totalQuestions: number
  progress: number
  questionScores: Array<{
    question_id: string
    score: number
    notes?: string
  }>
}

interface DownloadResultsButtonProps {
  projectName: string
  organizationName: string
  domainScores: DomainScore[]
  overallScore: number
}

export default function DownloadResultsButton({
  projectName,
  organizationName,
  domainScores,
  overallScore,
}: DownloadResultsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const downloadCSV = () => {
    try {
      // Create CSV content
      const csvContent = [
        ["Project Name", "Organization", "Domain", "Score", "Completed Questions", "Total Questions", "Progress %"],
        ...domainScores.map((domain) => [
          projectName,
          organizationName,
          domain.name,
          domain.score.toFixed(1),
          domain.completedQuestions.toString(),
          domain.totalQuestions.toString(),
          Math.round(domain.progress).toString(),
        ]),
        [], // Empty row
        ["Overall Score", overallScore.toFixed(1)],
      ]

      const csvString = csvContent.map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      // Create and download file
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${projectName}-assessment-results-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "CSV Downloaded",
        description: "Your assessment results have been exported to CSV",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data to CSV",
        variant: "destructive",
      })
    }
  }

  const downloadPDF = async () => {
    setIsGenerating(true)
    try {
      // Import jsPDF dynamically to avoid SSR issues
      const { jsPDF } = await import("jspdf")
      const doc = new jsPDF()

      // Set up the document
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let yPosition = margin

      // Title
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("Assessment Results", margin, yPosition)
      yPosition += 15

      // Project info
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text(`Project: ${projectName}`, margin, yPosition)
      yPosition += 8
      doc.text(`Organization: ${organizationName}`, margin, yPosition)
      yPosition += 8
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 15

      // Overall score
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Overall Score", margin, yPosition)
      yPosition += 10
      doc.setFontSize(24)
      doc.text(`${overallScore.toFixed(1)}/10`, margin, yPosition)
      yPosition += 20

      // Domain scores
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Domain Scores", margin, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      // Table headers
      const headers = ["Domain", "Score", "Progress"]
      const colWidths = [100, 30, 40]
      let xPosition = margin

      doc.setFont("helvetica", "bold")
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition)
        xPosition += colWidths[index]
      })
      yPosition += 8

      // Table rows
      doc.setFont("helvetica", "normal")
      domainScores.forEach((domain) => {
        if (yPosition > 250) {
          // Add new page if needed
          doc.addPage()
          yPosition = margin
        }

        xPosition = margin
        const rowData = [
          domain.name,
          `${domain.score.toFixed(1)}/10`,
          `${domain.completedQuestions}/${domain.totalQuestions}`,
        ]

        rowData.forEach((data, index) => {
          doc.text(data, xPosition, yPosition)
          xPosition += colWidths[index]
        })
        yPosition += 8
      })

      // Add recommendations section
      yPosition += 15
      if (yPosition > 200) {
        doc.addPage()
        yPosition = margin
      }

      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Recommendations", margin, yPosition)
      yPosition += 15

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      const priorityAreas = domainScores.filter((domain) => domain.score > 0 && domain.score < 6.0)
      const strengths = domainScores.filter((domain) => domain.score >= 8.0)

      if (priorityAreas.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("Priority Areas (Score < 6.0):", margin, yPosition)
        yPosition += 8
        doc.setFont("helvetica", "normal")

        priorityAreas.forEach((domain) => {
          doc.text(`• ${domain.name}: ${domain.score.toFixed(1)}/10`, margin + 5, yPosition)
          yPosition += 6
        })
        yPosition += 8
      }

      if (strengths.length > 0) {
        doc.setFont("helvetica", "bold")
        doc.text("Strengths (Score ≥ 8.0):", margin, yPosition)
        yPosition += 8
        doc.setFont("helvetica", "normal")

        strengths.forEach((domain) => {
          doc.text(`• ${domain.name}: ${domain.score.toFixed(1)}/10`, margin + 5, yPosition)
          yPosition += 6
        })
      }

      // Save the PDF
      doc.save(`${projectName}-assessment-results-${new Date().toISOString().split("T")[0]}.pdf`)

      toast({
        title: "PDF Generated",
        description: "Your assessment results have been exported to PDF",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isGenerating}>
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? "Generating..." : "Download Results"}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadPDF} disabled={isGenerating}>
          <FileText className="h-4 w-4 mr-2" />
          Download as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
