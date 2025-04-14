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

  // Try to get scores from assessment_scores table first
  let { data: assessmentScores, error: assessmentScoresError } = await supabase
    .from("assessment_scores")
    .select("*")
    .eq("project_id", params.id)

  // If that fails, try the scores table
  if (assessmentScoresError || !assessmentScores || assessmentScores.length === 0) {
    console.log("No data in assessment_scores table, trying scores table...")
    const { data: scores, error: scoresError } = await supabase.from("scores").select("*").eq("project_id", params.id)

    if (scoresError) {
      console.error("Error fetching scores:", scoresError)
    } else if (scores && scores.length > 0) {
      console.log("Found scores in scores table:", scores.length)
      assessmentScores = scores
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
            <p className="font-medium">{project.organizations?.name || "No organization"}</p>
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

      <DomainsList projectId={params.id} scores={assessmentScores || []} />
    </div>
  )
}
