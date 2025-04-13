"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createFixedSupabaseClient } from "@/lib/supabase/fixed-client"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function FixedProjectDebug() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      // Use the fixed client
      const supabase = createFixedSupabaseClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(`Auth error: ${userError.message}`)
      }

      if (!user) {
        throw new Error("No authenticated user found")
      }

      setUserId(user.id)

      // Get projects where user is owner
      const { data: ownerProjects, error: ownerError } = await supabase
        .from("projects")
        .select("*")
        .eq("owner_id", user.id)

      if (ownerError) {
        throw new Error(`Projects error: ${ownerError.message}`)
      }

      setProjects(ownerProjects || [])
      console.log("Projects found:", ownerProjects?.length || 0)
    } catch (err: any) {
      console.error("Error checking projects:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fixed Project Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          This tool uses a fixed Supabase client that directly accesses your auth token cookie to check for projects.
        </p>

        <Button onClick={checkProjects} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking Projects...
            </>
          ) : (
            "Check Projects (Fixed Method)"
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {userId && !error && (
          <div className="mt-4">
            <p className="text-sm">User ID: {userId}</p>
          </div>
        )}

        {projects.length > 0 ? (
          <div className="mt-4">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Projects Found!</AlertTitle>
              <AlertDescription className="text-green-700">
                Found {projects.length} projects using the fixed client.
              </AlertDescription>
            </Alert>

            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Project List:</h3>
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li key={project.id} className="text-sm border-l-2 border-primary pl-2">
                    {project.name} (ID: {project.id})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : projects.length === 0 && !loading && userId && !error ? (
          <Alert variant="default" className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">No Projects Found</AlertTitle>
            <AlertDescription className="text-yellow-700">
              No projects found for your user ID using the fixed client.
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
