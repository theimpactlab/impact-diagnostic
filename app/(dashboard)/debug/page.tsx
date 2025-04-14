import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SimpleProjectDebug from "@/components/debug/simple-project-debug"
import SimpleProjectCreator from "@/components/debug/simple-project-creator"

export const dynamic = "force-dynamic"

export default function DebugPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Debug Tools</h1>
          <p className="text-muted-foreground">Tools to help diagnose and fix issues with your application</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button asChild>
            <Link href="/auth-debug">Authentication Debug</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Visibility Debug</CardTitle>
            <CardDescription>Diagnose issues with project visibility and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleProjectDebug />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Test Project</CardTitle>
            <CardDescription>Create a test project directly in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleProjectCreator />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database Relationship Issue</CardTitle>
            <CardDescription>Information about the organization relationship issue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <h3 className="font-medium text-yellow-800">Database Schema Issue Detected</h3>
              <p className="text-yellow-700 mt-1">
                There appears to be an issue with the relationship between profiles and organizations tables. The error
                message "Could not embed because more than one relationship was found for 'profiles' and
                'organizations'" indicates that there are multiple foreign key relationships defined between these
                tables.
              </p>
              <p className="text-yellow-700 mt-2">
                This is likely causing issues with queries that try to join these tables. The tools on this page have
                been designed to work around this issue.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Possible Solutions:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Use the simplified tools on this page that avoid the problematic relationship</li>
                <li>
                  Fix the database schema by removing duplicate foreign key relationships (requires database
                  administration)
                </li>
                <li>Update your application code to avoid joining profiles and organizations tables directly</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>After using these tools, try these steps:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create a test project using the Simple Project Creator above</li>
              <li>
                Go to the{" "}
                <Link href="/dashboard" className="text-blue-600 hover:underline">
                  Dashboard
                </Link>{" "}
                to see if your project appears
              </li>
              <li>
                If projects still don't appear, run the Project Visibility Debug tool to check if projects exist in the
                database
              </li>
              <li>
                If projects exist but don't appear on the dashboard, there might be an issue with the query in the
                dashboard component
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
