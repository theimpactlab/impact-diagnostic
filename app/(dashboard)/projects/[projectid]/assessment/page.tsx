import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import DomainOverviewWrapper from "@/components/assessment/domain-overview-wrapper"

export const dynamic = "force-dynamic"

interface PageProps {
  params: {
    projectId: string
  }
}

// Domain definitions
const DOMAINS = [
  {
    id: "purpose_alignment",
    name: "Purpose Alignment",
    description: "Alignment of impact measurement with organizational purpose",
  },
  {
    id: "purpose_statement",
    name: "Purpose Statement",
    description: "Clarity and effectiveness of purpose statement",
  },
  {
    id: "leadership_for_impact",
    name: "Leadership for Impact",
    description: "Leadership commitment to impact measurement",
  },
  {
    id: "theory_of_change",
    name: "Theory of Change",
    description: "Impact-focused theory of change",
  },
  {
    id: "measurement_framework",
    name: "Measurement Framework",
    description: "Impact measurement framework",
  },
  {
    id: "status_of_data",
    name: "Status of Data",
    description: "Quality and availability of impact data",
  },
  {
    id: "system_capabilities",
    name: "System Capabilities",
    description: "Systems supporting impact measurement",
  },
]

export default async function AssessmentDomainsPage({ params }: PageProps) {
  const { projectId } = params
  const supabase = createServerComponentClient({ cookies })

  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    notFound()
  }

  // Get project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, description, organization_name")
    .eq("id", projectId)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Get assessment for this project
  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .select("id, created_at, updated_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Get completed domains
  const { data: completedDomains, error: domainsError } = await supabase
    .from("assessment_scores")
    .select("domain")
    .eq("assessment_id", assessment?.id || "")
    .is("score", "not.null")

  // Create a set of completed domain IDs
  const completedDomainIds = new Set((completedDomains || []).map((item) => item.domain))

  return (
    <DomainOverviewWrapper
      projectId={projectId}
      projectName={project.name}
      totalDomains={DOMAINS.length}
      completedDomains={completedDomainIds.size}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {DOMAINS.map((domain) => {
          const isCompleted = completedDomainIds.has(domain.id)
          return (
            <Card key={domain.id} className={isCompleted ? "border-green-200" : ""}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">{domain.name}</CardTitle>
                  <CardDescription>{domain.description}</CardDescription>
                </div>
                {isCompleted ? (
                  <Badge variant="default" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Circle className="h-3 w-3" />
                    Not Started
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={`/projects/${projectId}/assessment/${domain.id}`}>
                    {isCompleted ? "Review" : "Start"} Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </DomainOverviewWrapper>
  )
}
