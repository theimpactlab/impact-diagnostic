"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ASSESSMENT_DOMAINS } from "@/lib/constants"

export function ProjectDataDebug() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [projectData, setProjectData] = useState<any>(null)
  const [assessments, setAssessments] = useState<any[]>([])
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
    setAssessments([])
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

      // Get assessments for this project
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from("assessments")
        .select("*")
        .eq("project_id", selectedProject)
        .order("created_at", { ascending: false })

      if (assessmentsError) {
        console.error("Error fetching assessments:", assessmentsError)
      } else {
        setAssessments(assessmentsData || [])
      }

      // If we have assessments, get scores
      if (assessmentsData && assessmentsData.length > 0) {
        const assessmentId = assessmentsData[0].id

        // Get scores from assessment_scores table
        const { data: assessmentScoresData, error: assessmentScoresError } = await supabase
          .from("assessment_scores")
          .select("*")
          .eq("assessment_id", assessmentId)

        if (assessmentScoresError) {
          console.error("Error fetching assessment_scores:", assessmentScoresError)
        } else {
          setAssessmentScores(assessmentScoresData || [])
        }

        // Get scores from scores table
        const { data: scoresData, error: scoresError } = await supabase
          .from("scores")
          .select("*")
          .eq("assessment_id", assessmentId)

        if (scoresError) {
          console.error("Error fetching scores:", scoresError)
        } else {
          setScores(scoresData || [])
        }
      }
    } catch (err: any) {
      setError(`Error running diagnostics: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Find domain by ID
  const findDomainById = (domainId: string) => {
    return ASSESSMENT_DOMAINS.find((d) => d.id === domainId) || { name: domainId, questions: [] }
  }

  // Find question by ID within a domain
  const findQuestionById = (domainId: string, questionId: string) => {
    const domain = findDomainById(domainId)
    const question = domain.questions?.find((q) => q.id === questionId)
    return question?.question || questionId
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
                  <span className="font-bold">Organization:</span>{" "}
                  {projectData.organizations?.name || projectData.organization_name || "None"}
                </div>
                <div>
                  <span className="font-bold">Created:</span> {new Date(projectData.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-bold">Owner ID:</span> {projectData.owner_id}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessments</CardTitle>
              <CardDescription>Assessments for this project</CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="text-amber-600">No assessments found for this project</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Updated At
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created By
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {assessments.map((assessment) => (
                        <tr key={assessment.id}>
                          <td className="px-4 py-2 text-sm">{assessment.id}</td>
                          <td className="px-4 py-2 text-sm">{new Date(assessment.created_at).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">{new Date(assessment.updated_at).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm">{assessment.created_by}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                        const domainId = score.domain || score.domain_id
                        const questionId = score.question_id || score.question
                        const domainName = findDomainById(domainId).name
                        const questionText = findQuestionById(domainId, questionId)

                        return (
                          <tr key={score.id}>
                            <td className="px-4 py-2 text-sm">{score.id}</td>
                            <td className="px-4 py-2 text-sm">{domainName}</td>
                            <td className="px-4 py-2 text-sm">{questionText}</td>
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
                        const domainId = score.domain || score.domain_id
                        const questionId = score.question || score.question_id
                        const domainName = findDomainById(domainId).name
                        const questionText = findQuestionById(domainId, questionId)

                        return (
                          <tr key={score.id}>
                            <td className="px-4 py-2 text-sm">{score.id}</td>
                            <td className="px-4 py-2 text-sm">{domainName}</td>
                            <td className="px-4 py-2 text-sm">{questionText}</td>
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
                    (score) => score.domain === domain.id || score.domain_id === domain.id,
                  )
                  const domainScoresFromScores = scores.filter(
                    (score) => score.domain === domain.id || score.domain_id === domain.id,
                  )

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
                  const totalQuestions = domain.questions?.length || 0
                  const progress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

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
