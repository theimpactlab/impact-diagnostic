"use client"

import { useState } from "react"
import { checkDatabaseSetup, addMissingColumns } from "@/app/actions/setup-database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Database, Copy, CheckCircle, AlertCircle } from "lucide-react"

export default function DatabaseSetup() {
  const [isChecking, setIsChecking] = useState(false)
  const [setupStatus, setSetupStatus] = useState<any>(null)
  const [sqlCommand, setSqlCommand] = useState<string>("")
  const { toast } = useToast()

  const checkSetup = async () => {
    setIsChecking(true)
    try {
      const result = await checkDatabaseSetup()
      setSetupStatus(result)

      if (result.needsSetup) {
        const sqlResult = await addMissingColumns()
        setSqlCommand(sqlResult.sqlCommand || "")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check database setup",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Setup
        </CardTitle>
        <CardDescription>Check if your database is properly configured for project status tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkSetup} disabled={isChecking}>
          {isChecking ? "Checking..." : "Check Database Setup"}
        </Button>

        {setupStatus && (
          <div className="space-y-4">
            {setupStatus.needsSetup ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Setup Required</AlertTitle>
                <AlertDescription>
                  {setupStatus.error}
                  {setupStatus.missingColumns && (
                    <div className="mt-2">
                      <strong>Missing columns:</strong> {setupStatus.missingColumns.join(", ")}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Database Ready</AlertTitle>
                <AlertDescription>Your database is properly configured for project status tracking.</AlertDescription>
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
  )
}
