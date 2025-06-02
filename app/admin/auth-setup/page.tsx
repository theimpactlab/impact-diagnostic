"use client"

import { useState } from "react"
import { setupAuthTables } from "@/app/actions/setup-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Copy, Database, CheckCircle, AlertCircle } from "lucide-react"

export default function AuthSetupPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [sqlCommand, setSqlCommand] = useState<string>("")
  const { toast } = useToast()

  const runSetup = async () => {
    setIsRunning(true)
    try {
      const result = await setupAuthTables()
      setSetupStatus(result)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        if (result.sqlScript) {
          setSqlCommand(result.sqlScript)
        }
      } else if (result.success) {
        toast({
          title: "Success",
          description: result.success,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run auth setup",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const copySqlCommand = () => {
    navigator.clipboard.writeText(sqlCommand)
    toast({
      title: "Copied",
      description: "SQL command copied to clipboard",
    })
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Authentication Setup</h1>
        <p className="text-muted-foreground">Fix user registration issues by setting up the required database tables</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Authentication Database Setup
          </CardTitle>
          <CardDescription>
            This tool will set up the necessary database tables and triggers for user registration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              This will attempt to create or fix the profiles table and related triggers needed for user registration.
              Make sure you have database admin privileges.
            </AlertDescription>
          </Alert>

          <Button onClick={runSetup} disabled={isRunning}>
            {isRunning ? "Running Setup..." : "Run Auth Setup"}
          </Button>

          {setupStatus && (
            <div className="space-y-4">
              {setupStatus.error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Setup Failed</AlertTitle>
                  <AlertDescription>{setupStatus.error}</AlertDescription>
                </Alert>
              ) : (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Setup Successful</AlertTitle>
                  <AlertDescription>{setupStatus.success}</AlertDescription>
                </Alert>
              )}

              {sqlCommand && (
                <div className="space-y-2">
                  <h4 className="font-medium">Run this SQL command in your Supabase SQL Editor:</h4>
                  <div className="relative">
                    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto max-h-96">{sqlCommand}</pre>
                    <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={copySqlCommand}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Instructions</AlertTitle>
                    <AlertDescription>
                      1. Go to your Supabase dashboard
                      <br />
                      2. Navigate to the SQL Editor
                      <br />
                      3. Paste and run the SQL command above
                      <br />
                      4. Come back and check the setup again
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Registration Issues</CardTitle>
          <CardDescription>Troubleshooting tips for user registration problems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Database error saving new user</h3>
            <p className="text-sm text-muted-foreground">
              This error typically occurs when the database is not properly set up to handle new user registrations. The
              most common causes are:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
              <li>Missing profiles table</li>
              <li>Missing or incorrect trigger on auth.users table</li>
              <li>Errors in the handle_new_user function</li>
              <li>Database permission issues</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-2">Manual Fix</h3>
            <p className="text-sm text-muted-foreground">
              If the automatic setup doesn't work, you can manually run the SQL commands in your Supabase SQL Editor.
              This will create the necessary tables and triggers for user registration.
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Testing Registration</h3>
            <p className="text-sm text-muted-foreground">
              After running the setup, try registering a new user to see if the issue is resolved. If you still
              encounter problems, check the browser console for more detailed error messages.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
