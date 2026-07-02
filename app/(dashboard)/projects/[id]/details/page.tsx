import { notFound } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import ProjectDetailsForm from "@/components/projects/project-details-form"

export const dynamic = "force-dynamic"

interface DetailsPageProps {
  params: {
    id: string
  }
}

export default async function DetailsPage({ params }: DetailsPageProps) {
  const supabase = await createServerSupabaseClient()

  // Get project details
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  return <ProjectDetailsForm project={project} />
}
