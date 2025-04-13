import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Domain {
  id: string
  name: string
  description: string
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

export default function DomainsList({ domains, projectId, assessmentId }: DomainsListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {domains.map((domain) => (
        <Card key={domain.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{domain.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">{domain.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(domain.progress)}%</span>
              </div>
              <Progress value={domain.progress} className="h-2" />
            </div>
            {domain.completedQuestions > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span>Average Score</span>
                  <span>{domain.score.toFixed(1)}/10</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/projects/${projectId}/${domain.id}`}>
                {domain.completedQuestions > 0 ? "Continue Assessment" : "Start Assessment"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
