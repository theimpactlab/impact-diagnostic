"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function ProjectQueryDebug() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdProject, setCreatedProject] = useState<any>(null)

  const runProjectQueries = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setResults(null)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw new Error(`Auth error: ${userError.message}`)
      if (!user) throw new Error("No authenticated user found")

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", user.id)
        .single()

      if (profileError) throw new Error(`Profile error: ${profileError.message}`)

      // Test direct query for projects
      const { data: directProjects, error: directError } = await supabase.from("projects").select("*").limit(50)

      if (directError) throw new Error(`Direct projects query error: ${directError.message}`)

      // Test query for user's projects
      const { data: userProjects, error: userProjectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)

      if (userProjectsError) throw new Error(`User projects query error: ${userProjectsError.message}`)

      // Test query for collaborator projects
      const { data: collabProjects, error: collabError } = await supabase
        .from("project_collaborators")
        .select("project_id")
        .eq("user_id", user.id)

      if (collabError) throw new Error(`Collaborator projects query error: ${collabError.message}`)

      // Check RLS policies
      const { data: rlsPolicies, error: rlsError } = await supabase
        .rpc("get_policies_for_table", {
          table_name: "projects",
        })
        .catch(() => ({ data: null, error: new Error("RPC not available") }))

      setResults({
        user,
        profile,
        directProjects: directProjects || [],
        userProjects: userProjects || [],
        collabProjects: collabProjects || [],
        rlsPolicies: rlsPolicies || "RPC not available",
      })

      setSuccess("Project queries completed successfully")
    } catch (err: any) {
      console.error("Project query error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const createTestProject = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    setCreatedProject(null)

    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw new Error(`Auth error: ${userError.message}`)
      if (!user) throw new Error("No authenticated user found")

      // Create a test project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            name: `Test Project ${new Date().toISOString()}`,
            description: "Automatically created test project",
            owner_id: user.id,
            organization_name: "Test Organization",
          },
        ])
        .select()

      if (projectError) throw new Error(`Project creation error: ${projectError.message}`)

      setCreatedProject(project)
      setSuccess("Test project created successfully!")
    } catch (err: any) {
      console.error("Project creation error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Query Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runProjectQueries} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running queries...
                </>
              ) : (
                "Run Project Queries"
              )}
            </Button>

            <Button onClick={createTestProject} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Test Project"
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {createdProject && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Created Test Project:</h3>
              <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                <pre className="text-xs">{JSON.stringify(createdProject, null, 2)}</pre>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-medium mb-2">User Information:</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <p>
                    <strong>User ID:</strong> {results.user.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {results.user.email}
                  </p>
                  <p>
                    <strong>Is Super User:</strong> {results.profile?.is_super_user ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Organization:</strong> {results.profile?.organizations?.name || "None"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Direct Projects Query (All Projects):</h3>
                <p className="text-sm mb-2">Found: {results.directProjects.length} projects</p>
                {results.directProjects.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(results.directProjects, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500">No projects found in the database.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">User's Projects:</h3>
                <p className="text-sm mb-2">Found: {results.userProjects.length} projects</p>
                {results.userProjects.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(results.userProjects, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500">No projects found where you are the owner.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Collaborator Projects:</h3>
                <p className="text-sm mb-2">Found: {results.collabProjects.length} projects</p>
                {results.collabProjects.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <pre className="text-xs">{JSON.stringify(results.collabProjects, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="text-gray-500">No projects found where you are a collaborator.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">RLS Policies:</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <pre className="text-xs">{JSON.stringify(results.rlsPolicies, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
