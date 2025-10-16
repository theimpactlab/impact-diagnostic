"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { format } from "date-fns"

interface QuestionScore {
  question_id: string
  score: number
  notes: string | null
}

interface DomainScore {
  id: string
  name: string
  score: number
  completedQuestions: number
  totalQuestions: number
  progress: number
  questionScores: QuestionScore[]
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
  function downloadResults() {
    let csvContent =
      "Domain,Score,MaxScore,CompletedQuestions,TotalQuestions,Progress,QuestionID,QuestionScore,QuestionNotes\n"

    domainScores.forEach((domain) => {
      const maxScore = domain.totalQuestions // Assuming max score is the total number of questions
      const progressPercentage = domain.progress.toFixed(1)

      domain.questionScores.forEach((question) => {
        const questionNotes = question.notes ? `"${question.notes.replace(/"/g, '""')}"` : "" // Escape double quotes for CSV
        csvContent += `"${domain.name}",${domain.score.toFixed(1)},${maxScore},${domain.completedQuestions},${domain.totalQuestions},${progressPercentage},${question.question_id},${question.score},${questionNotes}\n`
      })

      // Add a row for the domain summary if no questions are present for it
      if (domain.questionScores.length === 0) {
        csvContent += `"${domain.name}",${domain.score.toFixed(1)},${maxScore},0,${domain.totalQuestions},${progressPercentage},N/A,N/A,N/A\n`
      }
    })

    // Add overall score summary
    csvContent += `\n\nOverall Score:,${overallScore.toFixed(1)},N/A,N/A,N/A,N/A,N/A,N/A,N/A\n`
    csvContent += `Project:,${projectName},N/A,N/A,N/A,N/A,N/A,N/A,N/A\n`
    csvContent += `Organization:,${organizationName},N/A,N/A,N/A,N/A,N/A,N/A,N/A\n`
    csvContent += `Export Date:,${new Date().toISOString().split("T")[0]},N/A,N/A,N/A,N/A,N/A,N/A,N/A\n`

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute(
      "download",
      `${projectName.replace(/\s+/g, "-")}-assessment-results-${format(new Date(), "yyyy-MM-dd")}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <Button onClick={downloadResults} variant="default" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Download Results
    </Button>
  )
  \
}

