import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AnalyticsData {
  projects: any[]
  assessments: any[]
  scores: any[]
}

interface DataDebugProps {
  data: AnalyticsData
}

export default function DataDebug({ data }: DataDebugProps) {
  const { projects, assessments, scores } = data

  // Sample data for each table
  const sampleProject = projects[0]
  const sampleAssessment = assessments[0]
  const sampleScore = scores[0]

  // Get unique domains
  const uniqueDomains = Array.from(new Set(scores.map((s) => s.domain))).filter(Boolean)

  // Get project statuses
  const projectStatuses = Array.from(new Set(projects.map((p) => p.status))).filter(Boolean)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Debug Information</CardTitle>
          <CardDescription>Raw data from your database to help debug domain analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Projects */}
          <div>
            <h3 className="font-medium mb-2">Projects ({projects.length} total)</h3>
            <div className="text-sm space-y-1">
              <p>
                <strong>Project Statuses:</strong> {projectStatuses.join(", ") || "None found"}
              </p>
              <p>
                <strong>Completed Projects:</strong> {projects.filter((p) => p.status === "completed").length}
              </p>
              {sampleProject && (
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <strong>Sample Project:</strong>
                  <br />
                  ID: {sampleProject.id}
                  <br />
                  Name: {sampleProject.name}
                  <br />
                  Status: {sampleProject.status || "undefined"}
                  <br />
                  Organization: {sampleProject.organization_name || "undefined"}
                </div>
              )}
            </div>
          </div>

          {/* Assessments */}
          <div>
            <h3 className="font-medium mb-2">Assessments ({assessments.length} total)</h3>
            {sampleAssessment && (
              <div className="bg-gray-50 p-2 rounded text-xs">
                <strong>Sample Assessment:</strong>
                <br />
                ID: {sampleAssessment.id}
                <br />
                Project ID: {sampleAssessment.project_id}
                <br />
                Created: {sampleAssessment.created_at}
              </div>
            )}
          </div>

          {/* Scores */}
          <div>
            <h3 className="font-medium mb-2">Scores ({scores.length} total)</h3>
            <div className="space-y-2">
              <div>
                <strong>Unique Domains Found:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {uniqueDomains.length > 0 ? (
                    uniqueDomains.map((domain, index) => (
                      <Badge key={index} variant="outline">
                        "{domain}"
                      </Badge>
                    ))
                  ) : (
                    <span className="text-red-600">No domains found</span>
                  )}
                </div>
              </div>
              {sampleScore && (
                <div className="bg-gray-50 p-2 rounded text-xs">
                  <strong>Sample Score:</strong>
                  <br />
                  Assessment ID: {sampleScore.assessment_id}
                  <br />
                  Domain: "{sampleScore.domain}"<br />
                  Score: {sampleScore.score}
                  <br />
                  Created: {sampleScore.created_at}
                </div>
              )}
            </div>
          </div>

          {/* All scores by domain */}
          {uniqueDomains.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Scores by Domain</h3>
              <div className="space-y-2">
                {uniqueDomains.map((domain, index) => {
                  const domainScores = scores.filter((s) => s.domain === domain)
                  const avgScore = domainScores.reduce((sum, s) => sum + s.score, 0) / domainScores.length
                  return (
                    <div key={index} className="text-sm">
                      <strong>"{domain}":</strong> {domainScores.length} scores, avg: {avgScore.toFixed(1)}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
