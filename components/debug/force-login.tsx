"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { forceLogin } from "@/lib/supabase/force-login"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export default function ForceLogin() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean | null
    message: string | null
  }>({
    success: null,
    message: null,
  })

  const handleForceLogin = async () => {
    setLoading(true)
    try {
      const { success, error, user } = await forceLogin()

      if (success) {
        setResult({
          success: true,
          message: `Successfully forced login for ${user?.email}. Reloading page...`,
        })
      } else {
        setResult({
          success: false,
          message: `Failed to force login: ${error}`,
        })
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: `Error: ${err.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Force Login Fix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          This tool will attempt to fix the "Auth session missing" error by manually setting the session from your
          existing auth cookie.
        </p>

        {result.success === true && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{result.message}</AlertDescription>
          </Alert>
        )}

        {result.success === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}

        <Button onClick={handleForceLogin} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Fixing Session...
            </>
          ) : (
            "Force Login Fix"
          )}
        </Button>

        <p className="text-xs text-gray-500 mt-2 text-center">Use this as a last resort if other methods don't work</p>
      </CardContent>
    </Card>
  )
}
