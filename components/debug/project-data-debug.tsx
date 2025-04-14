"use client"

import { Progress } from "@/components/ui/progress"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"

export function ProjectDataDebug() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [projectData, setProjectData] = useState<any>(null)
  const [assessmentScores, setAssessmentScores] = useState<any[]>([])
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  // Load projects
  const loadProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: false })

      if (error) throw error

      setProjects(data || [])
    } catch (err: any) {
      setError(`Error loading projects: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Run diagnostics on selected project
  const runDiagnostics = async () => {
    if (!selectedProject) return

    setLoading(true)
    setError(null)
    setProjectData(null)
    setAssessmentScores([])
    setScores([])

    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*, organizations(*)")
        .eq("id", selectedProject)
        .single()

      if (projectError) throw projectError

      setProjectData(project)

      // Get scores from assessment_scores table
      const { data: assessmentScoresData, error: assessmentScoresError } = await supabase
        .from("assessment_scores")
        .select("*")
        .eq("project_id", selectedProject)

      if (assessmentScoresError) {
        console.error("Error fetching assessment_scores:", assessmentScoresError)
      } else {
        setAssessmentScores(assessmentScoresData || [])
      }

      // Get scores from scores table
      const { data: scoresData, error: scoresError } = await supabase
        .from("scores")
        .select("*")
        .eq("project_id", selectedProject)

      if (scoresError) {
        console.error("Error fetching scores:", scoresError)
      } else {
        setScores(scoresData || [])
      }
    } catch (err: any) {
      setError(`Error running diagnostics: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={loadProjects} disabled={loading}>
          Load Projects
        </Button>

        <div className="flex-1">
          <Select
            value={selectedProject}
            onValueChange={setSelectedProject}
            disabled={loading || projects.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={runDiagnostics} disabled={loading || !selectedProject} variant="secondary">
          Run Diagnostics
        </Button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>}

      {loading && <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">Loading data...</div>}

      {projectData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
              <CardDescription>Basic project details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-bold">ID:</span> {projectData.id}
                </div>
                <div>
                  <span className="font-bold">Name:</span> {projectData.name}
                </div>
                <div>
                  <span className="font-bold">Organization:</span> {projectData.organizations?.name || "None"}
                </div>
                <div>
                  <span className="font-bold">Created:</span> {new Date(projectData.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-bold">Owner ID:</span> {projectData.user_id}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Scores Table</CardTitle>
              <CardDescription>Data from the assessment_scores table</CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentScores.length === 0 ? (
                <div className="text-amber-600">No records found in assessment_scores table</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assessmentScores.map((score) => {
                        const domain = ASSESSMENT_DOMAINS.find((d) => d.id === score.domain_id)
                        const question = domain?.questions?.find((q) => q.id === score.question_id)

                        return (
                          <tr key={score.id}>
                            <td className="px-4 py-2 text-sm">{score.id}</td>
                            <td className="px-4 py-2 text-sm">{domain?.name || score.domain_id}</td>
                            <td className="px-4 py-2 text-sm">{question?.text || score.question_id}</td>
                            <td className="px-4 py-2 text-sm">{score.score}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scores Table</CardTitle>
              <CardDescription>Data from the scores table</CardDescription>
            </CardHeader>
            <CardContent>
              {scores.length === 0 ? (
                <div className="text-amber-600">No records found in scores table</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Domain
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {scores.map((score) => {
                        const domain = ASSESSMENT_DOMAINS.find((d) => d.id === score.domain)
                        const question = domain?.questions?.find((q) => q.id === score.question)

                        return (
                          <tr key={score.id}>
                            <td className="px-4 py-2 text-sm">{score.id}</td>
                            <td className="px-4 py-2 text-sm">{domain?.name || score.domain}</td>
                            <td className="px-4 py-2 text-sm">{question?.text || score.question}</td>
                            <td className="px-4 py-2 text-sm">{score.score}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Progress Analysis</CardTitle>
              <CardDescription>Calculated progress for each domain</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ASSESSMENT_DOMAINS.map((domain) => {
                  // Filter scores for this domain from both tables
                  const domainScoresFromAssessmentScores = assessmentScores.filter(
                    (score) => score.domain_id === domain.id,
                  )
                  const domainScoresFromScores = scores.filter((score) => score.domain === domain.id)

                  // Count questions with scores
                  const answeredQuestionsFromAssessmentScores = domainScoresFromAssessmentScores.filter(
                    (score) => score.score !== null && score.score !== undefined,
                  ).length
                  const answeredQuestionsFromScores = domainScoresFromScores.filter(
                    (score) => score.score !== null && score.score !== undefined,
                  ).length

                  // Use the table with more data
                  const answeredQuestions = Math.max(answeredQuestionsFromAssessmentScores, answeredQuestionsFromScores)

                  // Calculate progress
                  const totalQuestions = domain.questions?.length || 1
                  const progress = Math.round((answeredQuestions / totalQuestions) * 100)

                  return (
                    <div key={domain.id}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{domain.name}</span>
                        <span className="text-sm">
                          {answeredQuestions}/{totalQuestions} questions
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 mt-1" />
                      <div className="text-xs text-gray-500 mt-1">{progress}% complete</div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
