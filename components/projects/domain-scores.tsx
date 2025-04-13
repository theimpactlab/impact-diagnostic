import Link from "next/link"
import {
  BarChart,
  Database,
  FileText,
  GitBranch,
  Settings,
  Target,
  Users,
  type LucideIcon,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DomainScore {
  id: string
  name: string
  score: number
  completedQuestions: number
  totalQuestions: number
  progress: number
  questionScores: any[]
}

interface DomainScoresProps {
  domainScores: DomainScore[]
  projectId: string
}

const iconMap: Record<string, LucideIcon> = {
  Target,
  FileText,
  Users,
  GitBranch,
  BarChart,
  Database,
  Settings,
}

export default function DomainScores({ domainScores, projectId }: DomainScoresProps) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Domain Scores</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {domainScores.map((domain) => {
          const Icon = iconMap[domain.id] || Target

          return (
            <Card key={domain.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center">
                      <Icon className="h-5 w-5 mr-2 text-muted-foreground" />
                      {domain.name}
                    </CardTitle>
                    <CardDescription>
                      {domain.completedQuestions} of {domain.totalQuestions} questions answered
                    </CardDescription>
                  </div>
                  {domain.progress > 0 && <div className="text-3xl font-bold">{domain.score.toFixed(1)}</div>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{Math.round(domain.progress)}%</span>
                  </div>
                  <Progress value={domain.progress} className="h-2" />
                </div>

                {domain.progress > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Strengths & Weaknesses</h4>
                    <ul className="text-sm space-y-1">
                      {domain.questionScores.length > 0 ? (
                        <>
                          <li className="text-green-600">
                            Highest score: {Math.max(...domain.questionScores.map((q) => q.score))} / 10
                          </li>
                          <li className="text-amber-600">
                            Lowest score: {Math.min(...domain.questionScores.map((q) => q.score))} / 10
                          </li>
                        </>
                      ) : (
                        <li className="text-muted-foreground">No questions answered yet</li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <Button asChild variant="ghost" className="w-full justify-between">
                  <Link href={`/projects/${projectId}/domains/${domain.id}`}>
                    <span>{domain.progress > 0 ? "View Details" : "Start Assessment"}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
