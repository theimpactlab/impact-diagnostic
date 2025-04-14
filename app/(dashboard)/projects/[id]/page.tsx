import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { DomainsList } from "@/components/projects/domains-list"
import { ProjectHeader } from "@/components/projects/project-header"

export const dynamic = "force-dynamic"

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return notFound()
  }

  // Get the project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*, organizations(*)")
    .eq("id", params.id)
    .single()

  if (projectError || !project) {
    console.error("Error fetching project:", projectError)
    return notFound()
  }

  // Get the assessment for this project
  const { data: assessments, error: assessmentError } = await supabase
    .from("assessments")
    .select("*")
    .eq("project_id", params.id)
    .order("created_at", { ascending: false })
    .limit(1)

  if (assessmentError) {
    console.error("Error fetching assessment:", assessmentError)
  }

  const assessmentId = assessments && assessments.length > 0 ? assessments[0].id : null

  // Try to get scores from assessment_scores table first
  let scores = []
  if (assessmentId) {
    const { data: assessmentScores, error: assessmentScoresError } = await supabase
      .from("assessment_scores")
      .select("*")
      .eq("assessment_id", assessmentId)

    if (assessmentScoresError) {
      console.error("Error fetching assessment_scores:", assessmentScoresError)
    } else if (assessmentScores && assessmentScores.length > 0) {
      scores = assessmentScores
    } else {
      // If no data in assessment_scores, try the scores table
      const { data: oldScores, error: oldScoresError } = await supabase
        .from("scores")
        .select("*")
        .eq("assessment_id", assessmentId)

      if (oldScoresError) {
        console.error("Error fetching scores:", oldScoresError)
      } else if (oldScores && oldScores.length > 0) {
        scores = oldScores
      }
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <ProjectHeader project={project} />

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Organization</p>
            <p className="font-medium">
              {project.organizations?.name || project.organization_name || "No organization"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{new Date(project.created_at).toLocaleDateString()}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Description</p>
            <p className="font-medium">{project.description || "No description provided"}</p>
          </div>
        </div>
      </div>

      <DomainsList projectId={params.id} scores={scores} />
    </div>
  )
}
