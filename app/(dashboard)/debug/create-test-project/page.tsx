"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

export default function CreateTestProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [projectData, setProjectData] = useState({
    name: `Test Project ${new Date().toLocaleDateString()}`,
    description: "This is a test project created from the debug tools.",
    organization_name: "Test Organization",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProjectData((prev) => ({ ...prev, [name]: value }))
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

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
            ...projectData,
            owner_id: user.id,
          },
        ])
        .select()

      if (projectError) throw new Error(`Project creation error: ${projectError.message}`)

      setSuccess(`Project "${projectData.name}" created successfully!`)

      // Try using the RPC function as a fallback
      if (!data || data.length === 0) {
        const { data: rpcData, error: rpcError } = await supabase.rpc("create_test_project", {
          project_name: projectData.name,
          project_description: projectData.description,
        })

        if (rpcError) throw new Error(`RPC project creation error: ${rpcError.message}`)

        if (rpcData) {
          setSuccess(`Project created successfully via RPC function!`)
        }
      }

      // Reset form
      setProjectData({
        name: `Test Project ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
        description: "This is a test project created from the debug tools.",
        organization_name: "Test Organization",
      })
    } catch (err: any) {
      console.error("Project creation error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/debug">Back to Debug Tools</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Test Project</CardTitle>
          <CardDescription>
            This tool creates a test project directly in the database, bypassing the normal UI flow.
          </CardDescription>
        </CardHeader>
        <form onSubmit={createProject}>
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" name="name" value={projectData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={projectData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization_name">Organization Name</Label>
              <Input
                id="organization_name"
                name="organization_name"
                value={projectData.organization_name}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/debug")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>After Creating a Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>After creating a test project, try these steps:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                Go to the{" "}
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                  Dashboard
                </Link>{" "}
                to see if your project appears
              </li>
              <li>
                Go to the{" "}
                <Link href="/projects" className="text-blue-600 hover:underline">
                  Projects page
                </Link>{" "}
                to see all your projects
              </li>
              <li>
                If projects still don't appear, return to the{" "}
                <Link href="/debug" className="text-blue-600 hover:underline">
                  Debug Tools
                </Link>{" "}
                and run the Project Query Diagnostics
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
