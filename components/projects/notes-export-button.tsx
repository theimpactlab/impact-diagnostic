"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface QuestionNote {
  question_id: string
  domain: string
  score: number
  notes: string
}

interface DomainNotes {
  domainId: string
  domainName: string
  notes: QuestionNote[]
  totalNotes: number
}

interface NotesExportButtonProps {
  projectName: string
  organizationName: string
  domainNotes: DomainNotes[]
}

export default function NotesExportButton({ projectName, organizationName, domainNotes }: NotesExportButtonProps) {
  function exportNotes() {
    // Create text content
    let content = `Assessment Notes Export\n`
    content += `========================\n\n`
    content += `Project: ${projectName}\n`
    content += `Organization: ${organizationName}\n`
    content += `Export Date: ${new Date().toLocaleDateString()}\n\n`

    domainNotes
      .filter((domain) => domain.totalNotes > 0)
      .forEach((domain) => {
        content += `\n${"=".repeat(50)}\n`
        content += `DOMAIN: ${domain.domainName.toUpperCase()}\n`
        content += `${"=".repeat(50)}\n\n`

        domain.notes.forEach((note, index) => {
          content += `${index + 1}. Question ${note.question_id} (Score: ${note.score})\n`
          content += `${"-".repeat(50)}\n`
          content += `${note.notes}\n\n`
        })
      })

    // Create and download file
    const blob = new Blob([content], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${projectName.replace(/\s+/g, "-")}-assessment-notes-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const totalNotes = domainNotes.reduce((sum, d) => sum + d.totalNotes, 0)

  if (totalNotes === 0) {
    return null
  }

  return (
    <Button onClick={exportNotes} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      Export Notes ({totalNotes})
    </Button>
  )
}
