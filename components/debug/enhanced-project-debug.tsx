"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"

export default function EnhancedProjectDebug() {
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [projectsData, setProjectsData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [organizationData, setOrganizationData] = useState<any>(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)

    try {
      // Step 1: Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw new Error(`Auth error: ${userError.message}`)
      if (!user) throw new Error("No authenticated user found")

      // Step 2: Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user.id)
        .single()

      if (profileError) throw new Error(`Profile error: ${profileError.message}`)

      // Step 3: Get projects where user is owner
      const { data: ownerProjects, error: ownerError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)

      if (ownerError) throw new Error(`Owner projects error: ${ownerError.message}`)

      // Step 4: Get projects where user is collaborator
      const { data: collabProjects, error: collabError } = await supabase
        .from("project_collaborators")
        .select("project_id")
        .eq("user_id", user.id)

      if (collabError) throw new Error(`Collaborator projects error: ${collabError.message}`)

      // Step 5: Get all projects (for debugging)
      const { data: allProjects, error: allProjectsError } = await supabase.from("projects").select("*").limit(10)

      if (allProjectsError) throw new Error(`All projects error: ${allProjectsError.message}`)

      // Step 6: Get organizations
      const { data: organizations, error: orgsError } = await supabase.from("organizations").select("*")

      if (orgsError) throw new Error(`Organizations error: ${orgsError.message}`)

      // Set all the data
      setUserData({
        user,
        profile,
        organization: profile?.organizations || null,
      })

      setProjectsData({
        ownerProjects: ownerProjects || [],
        collabProjects: collabProjects || [],
        allProjects: allProjects || [],
      })

      setOrganizationData(organizations || [])
    } catch (err: any) {
      console.error("Diagnostic error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Visibility Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostics} disabled={loading}>
            {loading ? "Running diagnostics..." : "Run Diagnostics"}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {userData && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">User Information</h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <p>
                  <strong>User ID:</strong> {userData.user.id}
                </p>
                <p>
                  <strong>Email:</strong> {userData.user.email}
                </p>
                <p>
                  <strong>Full Name:</strong> {userData.profile?.full_name || "Not set"}
                </p>
                <p>
                  <strong>Is Super User:</strong> {userData.profile?.is_super_user ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Organization ID:</strong> {userData.profile?.organization_id || "None"}
                </p>
                <p>
                  <strong>Organization Name:</strong> {userData.organization?.name || "None"}
                </p>
              </div>
            </div>
          )}

          {projectsData && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Projects Information</h3>

              <div>
                <h4 className="font-medium">Projects where you are owner: {projectsData.ownerProjects.length}</h4>
                {projectsData.ownerProjects.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md mt-2 overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(projectsData.ownerProjects, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">No projects found where you are the owner.</p>
                )}
              </div>

              <div>
                <h4 className="font-medium">
                  Projects where you are collaborator: {projectsData.collabProjects.length}
                </h4>
                {projectsData.collabProjects.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md mt-2 overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(projectsData.collabProjects, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">No projects found where you are a collaborator.</p>
                )}
              </div>

              <div>
                <h4 className="font-medium">Sample of all projects in database: {projectsData.allProjects.length}</h4>
                {projectsData.allProjects.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md mt-2 overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(projectsData.allProjects, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">No projects found in the database.</p>
                )}
              </div>
            </div>
          )}

          {organizationData && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Organizations: {organizationData.length}</h3>
              {organizationData.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">{JSON.stringify(organizationData, null, 2)}</pre>
                </div>
              ) : (
                <p className="text-gray-500">No organizations found.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
