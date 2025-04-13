import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get all projects for the user
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .or(`owner_id.eq.${session!.user.id},project_collaborators(user_id).eq.${session!.user.id}`)

  // Get all assessments for these projects
  const projectIds = projects?.map((p) => p.id) || []

  const domainAverages: Record<string, { score: number; count: number }> = {}

  if (projectIds.length > 0) {
    const { data: assessments } = await supabase.from("assessments").select("id").in("project_id", projectIds)

    if (assessments && assessments.length > 0) {
      const assessmentIds = assessments.map((a) => a.id)

      const { data: scores } = await supabase
        .from("assessment_scores")
        .select("domain, score")
        .in("assessment_id", assessmentIds)

      // Calculate average scores by domain
      if (scores) {
        scores.forEach((score) => {
          if (!domainAverages[score.domain]) {
            domainAverages[score.domain] = { score: 0, count: 0 }
          }
          domainAverages[score.domain].score += score.score
          domainAverages[score.domain].count += 1
        })
      }
    }
  }

  // Calculate final averages
  const finalAverages = Object.entries(domainAverages).map(([domain, data]) => ({
    domain,
    score: data.count > 0 ? data.score / data.count : 0,
    count: data.count,
  }))

  // Get domain names
  const domainMap = ASSESSMENT_DOMAINS.reduce(
    (acc, domain) => {
      acc[domain.id] = domain.name
      return acc
    },
    {} as Record<string, string>,
  )

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-8">Analytics</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
            <CardDescription>Number of projects you have access to</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{projectIds.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Overall Score</CardTitle>
            <CardDescription>Average score across all domains</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {finalAverages.length > 0
                ? (finalAverages.reduce((sum, item) => sum + item.score, 0) / finalAverages.length).toFixed(1)
                : "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessments Completed</CardTitle>
            <CardDescription>Total number of domain assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{finalAverages.reduce((sum, item) => sum + item.count, 0)}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Domain Averages</h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Domain
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Average Score
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Assessments
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {finalAverages.length > 0 ? (
              finalAverages.map((item) => (
                <tr key={item.domain}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {domainMap[item.domain] || item.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.score.toFixed(1)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  No assessment data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
