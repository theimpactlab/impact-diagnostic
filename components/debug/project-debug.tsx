"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

export default function ProjectDebug() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const checkProjects = async () => {
    setLoading(true)
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUserId(user?.id || null)

      if (!user) {
        console.error("No authenticated user found")
        return
      }

      // Get projects where user is owner
      const { data: ownerProjects, error: ownerError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)

      if (ownerError) {
        console.error("Error fetching owner projects:", ownerError)
      }

      // Get projects where user is collaborator
      const { data: collabProjects, error: collabError } = await supabase
        .from("project_collaborators")
        .select("project_id")
        .eq("user_id", user.id)

      if (collabError) {
        console.error("Error fetching collaborator projects:", collabError)
      }

      setProjects(ownerProjects || [])

      console.log("User ID:", user.id)
      console.log("Owner projects:", ownerProjects?.length || 0)
      console.log("Collaborator projects:", collabProjects?.length || 0)
    } catch (error) {
      console.error("Error checking projects:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border p-4 rounded-md mt-8">
      <h3 className="font-medium mb-4">Project Debug Tool</h3>
      <Button onClick={checkProjects} disabled={loading}>
        {loading ? "Checking..." : "Check My Projects"}
      </Button>

      {userId && (
        <div className="mt-4">
          <p className="text-sm">User ID: {userId}</p>
        </div>
      )}

      {projects.length > 0 ? (
        <div className="mt-4">
          <p className="font-medium">Found {projects.length} projects:</p>
          <ul className="mt-2 space-y-2">
            {projects.map((project) => (
              <li key={project.id} className="text-sm border-l-2 border-primary pl-2">
                {project.name} (ID: {project.id})
              </li>
            ))}
          </ul>
        </div>
      ) : projects.length === 0 && !loading && userId ? (
        <p className="mt-4 text-sm text-amber-600">No projects found for your user ID.</p>
      ) : null}
    </div>
  )
}
