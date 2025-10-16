"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NotesSection from "./notes-section"

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

interface EnhancedResultsOverviewProps {
  domainScores: DomainScore[]
  overallScore: number
}

export default function EnhancedResultsOverview({ domainScores, overallScore }: EnhancedResultsOverviewProps) {
  // Prepare notes data
  const domainNotes = domainScores.map((domain) => ({
    domainId: domain.id,
    domainName: domain.name,
    notes: domain.questionScores
      .filter((q) => q.notes && q.notes.trim() !== "")
      .map((q) => ({
        question_id: q.question_id,
        domain: domain.id,
        score: q.score,
        notes: q.notes || "",
      })),
    totalNotes: domain.questionScores.filter((q) => q.notes && q.notes.trim() !== "").length,
  }))

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    if (score >= 4) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent"
    if (score >= 6) return "Good"
    if (score >= 4) return "Fair"
    return "Needs Improvement"
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle>Overall Assessment Score</CardTitle>
          <CardDescription>Average score across all completed domains</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-6xl font-bold">{overallScore.toFixed(1)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Out of 10</span>
                <Badge variant={overallScore >= 7 ? "default" : overallScore >= 5 ? "secondary" : "destructive"}>
                  {getScoreLabel(overallScore)}
                </Badge>
              </div>
              <Progress value={overallScore * 10} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed View */}
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scores">Domain Scores</TabsTrigger>
          <TabsTrigger value="notes">
            Assessment Notes
            {domainNotes.reduce((sum, d) => sum + d.totalNotes, 0) > 0 && (
              <Badge variant="secondary" className="ml-2">
                {domainNotes.reduce((sum, d) => sum + d.totalNotes, 0)}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scores" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {domainScores.map((domain) => (
              <Card key={domain.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{domain.name}</CardTitle>
                    <span className={`text-2xl font-bold ${getScoreColor(domain.score)}`}>
                      {domain.score.toFixed(1)}
                    </span>
                  </div>
                  <CardDescription>
                    {domain.completedQuestions} of {domain.totalQuestions} questions answered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(domain.progress)}%</span>
                    </div>
                    <Progress value={domain.progress} />
                    {domain.questionScores.filter((q) => q.notes && q.notes.trim() !== "").length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <Badge variant="outline" className="text-xs">
                          {domain.questionScores.filter((q) => q.notes && q.notes.trim() !== "").length} note
                          {domain.questionScores.filter((q) => q.notes && q.notes.trim() !== "").length !== 1
                            ? "s"
                            : ""}{" "}
                          added
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <NotesSection domainNotes={domainNotes} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
