import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProjectDataDebug } from "@/components/debug/project-data-debug"

export const dynamic = "force-dynamic"

export default async function DebugPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Tools</h1>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h2 className="text-xl font-medium text-amber-800 mb-2">Authentication Required</h2>
          <p className="text-amber-700 mb-4">You need to be logged in to access the debug tools.</p>
          <Link href="/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Debug Tools</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <p className="text-gray-600">Tools to help diagnose and fix issues with your application</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
            <CardDescription>Diagnose issues with authentication and sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth-debug">
              <Button className="w-full">Go to Auth Debug</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Visibility Debug</CardTitle>
            <CardDescription>Diagnose issues with project visibility and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/debug/create-test-project">
              <Button className="w-full">Create Test Project</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Data Diagnostic</CardTitle>
          <CardDescription>Examine project data, assessments, and scores to diagnose issues</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectDataDebug />
        </CardContent>
      </Card>
    </div>
  )
}
