"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { FileText, MessageSquare } from "lucide-react"

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

interface NotesSectionProps {
  domainNotes: DomainNotes[]
}

export default function NotesSection({ domainNotes }: NotesSectionProps) {
  const totalNotes = domainNotes.reduce((sum, domain) => sum + domain.totalNotes, 0)

  if (totalNotes === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Notes</CardTitle>
          <CardDescription>No notes were added during this assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <p>Notes can be added in the optional text boxes during the assessment process.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Assessment Notes
        </CardTitle>
        <CardDescription>
          {totalNotes} note{totalNotes !== 1 ? "s" : ""} collected across{" "}
          {domainNotes.filter((d) => d.totalNotes > 0).length} domain
          {domainNotes.filter((d) => d.totalNotes > 0).length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {domainNotes
            .filter((domain) => domain.totalNotes > 0)
            .map((domain) => (
              <AccordionItem key={domain.domainId} value={domain.domainId}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{domain.domainName}</span>
                    <Badge variant="secondary" className="ml-2">
                      {domain.totalNotes} note{domain.totalNotes !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {domain.notes.map((note, index) => (
                      <div key={`${note.question_id}-${index}`} className="border-l-2 border-primary/20 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Question {note.question_id}</span>
                          <Badge variant="outline" className="text-xs">
                            Score: {note.score}
                          </Badge>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.notes}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
