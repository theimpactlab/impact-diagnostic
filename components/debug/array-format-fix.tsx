"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createArrayFormatClient } from "@/lib/supabase/array-format-client"
import { RefreshCw } from "lucide-react"

export default function ArrayFormatFix() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFix = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Create the specialized client which will fix the cookie format
      const supabase = createArrayFormatClient()

      // Test if we can get the user
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        throw error
      }

      if (data?.user) {
        setSuccess(true)
      } else {
        setError("Failed to get user data after fixing cookie format")
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Array Format Cookie Fix</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Your auth cookie is in an array format instead of a JSON object. This tool will convert it to the proper
          format and fix your authentication issues.
        </p>

        <Button onClick={handleFix} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Fixing Cookie Format...
            </>
          ) : (
            "Fix Cookie Format"
          )}
        </Button>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
            Cookie format fixed successfully! Try navigating to the{" "}
            <a href="/dashboard" className="underline font-medium">
              dashboard
            </a>{" "}
            now.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
