import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DOMAINS } from "@/lib/constants"
import { Progress } from "@/components/ui/progress"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return <div>Please log in to view analytics</div>
  }

  // Get all projects the user has access to
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })

  if (projectsError) {
    console.error("Error fetching projects:", projectsError)
    return <div>Error loading analytics data</div>
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>You need to create projects and complete assessments to see analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Go to the Projects section to create your first project.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get all assessments for these projects
  const projectIds = projects.map((p) => p.id)
  const { data: assessments, error: assessmentsError } = await supabase
    .from("assessments")
    .select("id, project_id, created_at, updated_at")
    .in("project_id", projectIds)

  if (assessmentsError) {
    console.error("Error fetching assessments:", assessmentsError)
    return <div>Error loading assessment data</div>
  }

  // Get all scores for these assessments
  const assessmentIds = assessments?.map((a) => a.id) || []
  const { data: scores, error: scoresError } = await supabase
    .from("scores")
    .select("id, assessment_id, domain_id, question_id, score, created_at")
    .in("assessment_id", assessmentIds)

  if (scoresError) {
    console.error("Error fetching scores:", scoresError)
    return <div>Error loading score data</div>
  }

  // Calculate domain averages
  const domainScores: Record<string, { total: number; count: number; avg: number }> = {}

  DOMAINS.forEach((domain) => {
    domainScores[domain.id] = { total: 0, count: 0, avg: 0 }
  })

  scores?.forEach((score) => {
    if (domainScores[score.domain_id]) {
      domainScores[score.domain_id].total += score.score
      domainScores[score.domain_id].count += 1
    }
  })

  // Calculate averages
  Object.keys(domainScores).forEach((domainId) => {
    const { total, count } = domainScores[domainId]
    domainScores[domainId].avg = count > 0 ? total / count : 0
  })

  // Calculate overall stats
  const totalProjects = projects.length
  const completedAssessments =
    assessments?.filter((a) => {
      const assessmentScores = scores?.filter((s) => s.assessment_id === a.id) || []
      const uniqueDomains = new Set(assessmentScores.map((s) => s.domain_id))
      return uniqueDomains.size === DOMAINS.length
    }).length || 0

  const totalQuestions = DOMAINS.reduce((sum, domain) => sum + domain.questions.length, 0)
  const answeredQuestions = scores?.length || 0
  const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  // Get recent activity
  const recentScores = [...(scores || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domain Analysis</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {projects[0]?.created_at
                    ? `First created on ${new Date(projects[0].created_at).toLocaleDateString()}`
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedAssessments}</div>
                <p className="text-xs text-muted-foreground">Out of {assessments?.length || 0} total assessments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{answeredQuestions}</div>
                <p className="text-xs text-muted-foreground">Out of {totalQuestions} total questions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Overall assessment completion</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Domain Score Overview</CardTitle>
                <CardDescription>Average scores across all domains</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DOMAINS.map((domain) => {
                    const avgScore = domainScores[domain.id]?.avg || 0
                    return (
                      <div key={domain.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{domain.name}</span>
                          <span className="text-sm font-medium">{avgScore.toFixed(1)}</span>
                        </div>
                        <Progress value={(avgScore / 10) * 100} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest assessment updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentScores.map((score) => {
                    const domain = DOMAINS.find((d) => d.id === score.domain_id)
                    const question = domain?.questions.find((q) => q.id === score.question_id)

                    return (
                      <div key={score.id} className="flex items-center">
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium leading-none">{domain?.name || "Unknown Domain"}</p>
                          <p className="text-sm text-muted-foreground">
                            {question?.text?.substring(0, 50) || "Unknown Question"}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Score: {score.score} • {new Date(score.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {recentScores.length === 0 && <p className="text-sm text-muted-foreground">No recent activity</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="domains">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DOMAINS.map((domain) => {
              const domainScore = domainScores[domain.id]
              const avgScore = domainScore?.avg || 0
              const answeredCount = domainScore?.count || 0
              const totalQuestions = domain.questions.length
              const completionPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

              return (
                <Card key={domain.id}>
                  <CardHeader>
                    <CardTitle>{domain.name}</CardTitle>
                    <CardDescription>
                      {answeredCount} of {domain.questions.length} questions answered
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Average Score</div>
                          <div className="text-xl font-bold">{avgScore.toFixed(1)}</div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${(avgScore / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Completion</div>
                          <div>{completionPercent.toFixed(0)}%</div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-600"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const projectAssessments = assessments?.filter((a) => a.project_id === project.id) || []
              const projectScores =
                scores?.filter((s) => projectAssessments.some((a) => a.id === s.assessment_id)) || []

              const uniqueDomains = new Set(projectScores.map((s) => s.domain_id))
              const completionPercent = DOMAINS.length > 0 ? (uniqueDomains.size / DOMAINS.length) * 100 : 0

              // Calculate average score for this project
              let totalScore = 0
              let scoreCount = 0

              projectScores.forEach((score) => {
                totalScore += score.score
                scoreCount++
              })

              const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0

              return (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>Created on {new Date(project.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Average Score</div>
                          <div className="text-xl font-bold">{avgScore.toFixed(1)}</div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${(avgScore / 10) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Domains Assessed</div>
                          <div>
                            {uniqueDomains.size} of {DOMAINS.length}
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-green-600"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Questions Answered</div>
                          <div>{projectScores.length}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Last Updated</div>
                        <div className="text-sm text-muted-foreground">
                          {projectAssessments.length > 0
                            ? new Date(
                                Math.max(...projectAssessments.map((a) => new Date(a.updated_at).getTime())),
                              ).toLocaleString()
                            : "No assessments yet"}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
