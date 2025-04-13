"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SimpleProjectDebug() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const runDiagnostics = async () => {
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

      // Get user profile (without joining organizations)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_super_user, organization_id")
        .eq("id", user.id)
        .single()

      if (profileError) throw new Error(`Profile error: ${profileError.message}`)

      // Get all projects (without filtering)
      const { data: allProjects, error: allProjectsError } = await supabase.from("projects").select("*")

      if (allProjectsError) throw new Error(`All projects query error: ${allProjectsError.message}`)

      // Get projects where user is owner
      const { data: ownedProjects, error: ownedProjectsError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)

      if (ownedProjectsError) throw new Error(`Owned projects query error: ${ownedProjectsError.message}`)

      setResults({
        user,
        profile,
        allProjects: allProjects || [],
        ownedProjects: ownedProjects || [],
      })

      setSuccess("Diagnostics completed successfully")
    } catch (err: any) {
      console.error("Diagnostics error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Project Diagnostics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runDiagnostics} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running diagnostics...
            </>
          ) : (
            "Run Diagnostics"
          )}
        </Button>

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

        {results && (
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-medium mb-2">User Information:</h3>
              <div className="bg-gray-50 p-4 rounded-md">
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
                  <strong>Organization ID:</strong> {results.profile?.organization_id || "None"}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">All Projects in Database:</h3>
              <p className="text-sm mb-2">Found: {results.allProjects.length} projects</p>
              {results.allProjects.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.allProjects.map((project: any) => (
                        <tr key={project.id}>
                          <td className="px-4 py-2 text-sm text-gray-500">{project.id.substring(0, 8)}...</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{project.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{project.organization_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {project.owner_id === results.user.id ? (
                              <span className="text-green-600 font-medium">You</span>
                            ) : (
                              project.owner_id.substring(0, 8) + "..."
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No projects found in the database.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Your Projects:</h3>
              <p className="text-sm mb-2">Found: {results.ownedProjects.length} projects</p>
              {results.ownedProjects.length > 0 ? (
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organization
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.ownedProjects.map((project: any) => (
                        <tr key={project.id}>
                          <td className="px-4 py-2 text-sm text-gray-500">{project.id.substring(0, 8)}...</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{project.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{project.organization_name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {new Date(project.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No projects found where you are the owner.</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
