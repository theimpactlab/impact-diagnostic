"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SimpleProjectCreator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdProject, setCreatedProject] = useState<any>(null)
  const [projectName, setProjectName] = useState(`Test Project ${new Date().toLocaleString()}`)

  const createProject = async () => {
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

      // Create project
      const { data, error: projectError } = await supabase
        .from("projects")
        .insert([
          {
            name: projectName,
            description: "Test project created from debug tools",
            organization_name: "Test Organization",
            owner_id: user.id,
          },
        ])
        .select()

      if (projectError) throw new Error(`Project creation error: ${projectError.message}`)

      // Create initial assessment for the project
      if (data && data.length > 0) {
        const { error: assessmentError } = await supabase.from("assessments").insert([
          {
            project_id: data[0].id,
            created_by: user.id,
          },
        ])

        if (assessmentError) {
          console.warn("Assessment creation error:", assessmentError)
          // Continue even if assessment creation fails
        }

        setCreatedProject(data[0])
        setSuccess(`Project "${projectName}" created successfully!`)

        // Update project name for next creation
        setProjectName(`Test Project ${new Date().toLocaleString()}`)
      } else {
        throw new Error("Project was created but no data was returned")
      }
    } catch (err: any) {
      console.error("Project creation error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple Project Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
          />
        </div>

        <Button onClick={createProject} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating project...
            </>
          ) : (
            "Create Project"
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

        {createdProject && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Created Project:</h3>
            <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
              <p>
                <strong>ID:</strong> {createdProject.id}
              </p>
              <p>
                <strong>Name:</strong> {createdProject.name}
              </p>
              <p>
                <strong>Organization:</strong> {createdProject.organization_name}
              </p>
              <p>
                <strong>Created At:</strong> {new Date(createdProject.created_at).toLocaleString()}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Now try going to the{" "}
                <a href="/dashboard" className="text-blue-600 hover:underline">
                  Dashboard
                </a>{" "}
                to see if your project appears.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
