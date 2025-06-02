"use client"

import { useState } from "react"
import { diagnoseAuthSetup, fixAuthSetup, testUserCreation } from "@/app/actions/diagnose-auth"
import { getSimpleAuthFix } from "@/app/actions/simple-auth-fix"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Copy, Database, CheckCircle, AlertCircle, XCircle, RefreshCw, TestTube } from "lucide-react"

export default function AuthSetupPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [sqlScript, setSqlScript] = useState<string>("")
  const [testResult, setTestResult] = useState<any>(null)
  const { toast } = useToast()

  const runDiagnostics = async () => {
    setIsRunning(true)
    try {
      const result = await diagnoseAuthSetup()
      setDiagnostics(result)

      if (result.error) {
        toast({
          title: "Diagnostic Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Diagnostics Complete",
          description: "Check the results below",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run diagnostics",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const generateFixScript = async () => {
    try {
      const result = await fixAuthSetup()
      setSqlScript(result.sqlScript)
      toast({
        title: "Fix Script Generated",
        description: "Copy and run the SQL script in Supabase",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate fix script",
        variant: "destructive",
      })
    }
  }

  const prepareTest = async () => {
    try {
      const result = await testUserCreation()
      setTestResult(result)

      if (result.error) {
        toast({
          title: "Test Preparation Failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Test Ready",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to prepare test",
        variant: "destructive",
      })
    }
  }

  const copySqlScript = () => {
    navigator.clipboard.writeText(sqlScript)
    toast({
      title: "Copied",
      description: "SQL script copied to clipboard",
    })
  }

  const getStatusIcon = (status: boolean | null) => {
    if (status === true) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (status === false) return <XCircle className="h-4 w-4 text-red-600" />
    return <AlertCircle className="h-4 w-4 text-yellow-600" />
  }

  const getStatusBadge = (status: boolean | null) => {
    if (status === true) return <Badge className="bg-green-100 text-green-800">OK</Badge>
    if (status === false) return <Badge variant="destructive">FAILED</Badge>
    return <Badge variant="secondary">UNKNOWN</Badge>
  }

  const generateSimpleFix = async () => {
    try {
      const result = await getSimpleAuthFix()
      setSqlScript(result.sqlScript)
      toast({
        title: "Simple Fix Script Generated",
        description: "This script will fix all auth issues. Copy and run in Supabase SQL Editor.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate simple fix script",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Authentication Diagnostics</h1>
        <p className="text-muted-foreground">Comprehensive diagnosis and fix for user registration issues</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Run Diagnostics
            </CardTitle>
            <CardDescription>Check all components of the auth system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runDiagnostics} disabled={isRunning} className="w-full">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? "animate-spin" : ""}`} />
              {isRunning ? "Running Diagnostics..." : "Run Full Diagnostics"}
            </Button>

            {diagnostics && (
              <div className="space-y-3">
                <h4 className="font-medium">Diagnostic Results:</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Profiles Table</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostics.diagnostics?.profilesTable)}
                      {getStatusBadge(diagnostics.diagnostics?.profilesTable)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Handle New User Function</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostics.diagnostics?.handleNewUserFunction)}
                      {getStatusBadge(diagnostics.diagnostics?.handleNewUserFunction)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auth Trigger</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(diagnostics.diagnostics?.authTrigger)}
                      {getStatusBadge(diagnostics.diagnostics?.authTrigger)}
                    </div>
                  </div>
                </div>

                {diagnostics.diagnostics?.errors?.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Issues Found</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside mt-2">
                        {diagnostics.diagnostics.errors.map((error: string, index: number) => (
                          <li key={index} className="text-xs">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Registration
            </CardTitle>
            <CardDescription>Prepare and test user registration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={prepareTest} variant="outline" className="w-full">
              <TestTube className="h-4 w-4 mr-2" />
              Prepare Test
            </Button>

            {testResult && (
              <div className="space-y-3">
                {testResult.error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Test Preparation Failed</AlertTitle>
                    <AlertDescription>{testResult.error}</AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Test Ready</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2">
                        <p>Current profiles in database: {testResult.profilesCount}</p>
                        <p>Test with email: {testResult.testEmail}</p>
                        <Button asChild size="sm" className="mt-2">
                          <a href="/signup" target="_blank" rel="noreferrer">
                            Open Signup Page
                          </a>
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Fix Script</CardTitle>
          <CardDescription>Generate a comprehensive SQL script to fix all authentication setup issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={generateSimpleFix} className="flex-1">
              Generate Simple Fix Script
            </Button>
            <Button onClick={generateFixScript} variant="outline" className="flex-1">
              Generate Advanced Fix
            </Button>
          </div>

          {sqlScript && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Instructions</AlertTitle>
                <AlertDescription>
                  1. Copy the SQL script below
                  <br />
                  2. Go to your Supabase dashboard → SQL Editor
                  <br />
                  3. Paste and run the entire script
                  <br />
                  4. Come back and run diagnostics again
                  <br />
                  5. Test user registration
                </AlertDescription>
              </Alert>

              <div className="relative">
                <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto max-h-96 border">{sqlScript}</pre>
                <Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={copySqlScript}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
          <CardDescription>Troubleshooting guide for registration problems</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Database Error Saving New User</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Missing profiles table</li>
                <li>• Broken trigger function</li>
                <li>• RLS policy issues</li>
                <li>• Function permission problems</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">After Running Fix Script</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Run diagnostics to verify</li>
                <li>• Test with a new email address</li>
                <li>• Check browser console for errors</li>
                <li>• Verify email confirmation works</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
