import Link from "next/link"
import { BarChart, Database, FileText, GitBranch, Settings, Target, Users, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface Domain {
  id: string
  name: string
  description: string
  icon?: string
  progress: number
  score: number
  completedQuestions: number
  totalQuestions: number
}

interface DomainsListProps {
  domains: Domain[]
  projectId: string
  assessmentId: string
}

const iconMap: Record<string, LucideIcon> = {
  leadership_for_impact: Users,
  theory_of_change: GitBranch,
  purpose_statement: FileText,
  purpose_alignment: Target,
  measurement_framework: BarChart,
  status_of_data: Database,
  systems_capabilities: Settings,
}

export default function DomainsList({ domains, projectId, assessmentId }: DomainsListProps) {
  // Calculate overall completion
  const totalQuestions = domains.reduce((sum, domain) => sum + domain.totalQuestions, 0)
  const completedQuestions = domains.reduce((sum, domain) => sum + domain.completedQuestions, 0)
  const overallProgress = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Overall Progress</h2>
            <p className="text-sm text-muted-foreground">
              {completedQuestions} of {totalQuestions} questions completed
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{Math.round(overallProgress)}%</span>
            {overallProgress === 100 && <p className="text-sm text-green-600">Assessment complete!</p>}
          </div>
        </div>
        <Progress value={overallProgress} className="h-2" />

        {overallProgress > 0 && (
          <div className="mt-4 flex justify-end">
            <Link href={`/projects/${projectId}/results`}>
              <Button variant="outline" size="sm">
                <BarChart className="mr-2 h-4 w-4" />
                View Results
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((domain) => {
          const Icon = iconMap[domain.id] || Target

          return (
            <Card key={domain.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Icon className="h-5 w-5 mr-2 text-muted-foreground" />
                    {domain.name}
                  </CardTitle>
                  {domain.progress > 0 && <div className="text-xl font-bold">{domain.score.toFixed(1)}</div>}
                </div>
                <CardDescription>
                  {domain.completedQuestions} of {domain.totalQuestions} questions answered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">{Math.round(domain.progress)}%</span>
                  </div>
                  <Progress value={domain.progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/50 px-6 py-3">
                <Button asChild variant="ghost" className="w-full justify-between">
                  <Link href={`/projects/${projectId}/${domain.id}?assessment=${assessmentId}`}>
                    <span>{domain.progress > 0 ? "Continue Assessment" : "Start Assessment"}</span>
                    <span className="sr-only">Go to {domain.name}</span>
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
