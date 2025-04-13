"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DOMAIN_QUESTIONS } from "@/lib/constants"

interface DomainScore {
  id: string
  name: string
  score: number
  questionScores: {
    question_id: string
    score: number
    notes: string | null
  }[]
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
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadResults = () => {
    setIsDownloading(true)

    try {
      // Create CSV content
      let csvContent = `"Impact Diagnostic Assessment Results"\n`
      csvContent += `"Project Name","${projectName}"\n`
      csvContent += `"Organization Name","${organizationName}"\n`
      csvContent += `"Overall Score","${overallScore.toFixed(2)}"\n\n`

      // Add domain scores
      csvContent += `"Domain","Score"\n`
      domainScores.forEach((domain) => {
        csvContent += `"${domain.name}","${domain.score.toFixed(2)}"\n`
      })

      csvContent += `\n"Detailed Scores"\n\n`

      // Add detailed scores for each domain
      domainScores.forEach((domain) => {
        const domainQuestions = DOMAIN_QUESTIONS[domain.id as keyof typeof DOMAIN_QUESTIONS] || []

        csvContent += `"${domain.name}"\n`
        csvContent += `"Question","Score","Notes"\n`

        domainQuestions.forEach((question) => {
          const scoreData = domain.questionScores.find((qs) => qs.question_id === question.id)
          const score = scoreData ? scoreData.score : "N/A"
          const notes = scoreData?.notes || ""

          csvContent += `"${question.question.replace(/"/g, '""')}","${score}","${notes.replace(/"/g, '""')}"\n`
        })

        csvContent += `\n`
      })

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `${organizationName} - Impact Assessment Results.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading results:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button onClick={downloadResults} disabled={isDownloading}>
      <Download className="mr-2 h-4 w-4" />
      {isDownloading ? "Downloading..." : "Download Results"}
    </Button>
  )
}
