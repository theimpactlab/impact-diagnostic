"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCookie } from "cookies-next"
import { RefreshCw } from "lucide-react"

export default function CookieInspector() {
  const [cookieData, setCookieData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inspectCookie = () => {
    setLoading(true)
    setError(null)

    try {
      // Get the auth token cookie directly
      const authTokenCookie = getCookie("sb-ujjbzummjplrvhwybiqp-auth-token")

      if (!authTokenCookie) {
        setError("No auth token cookie found")
        setCookieData(null)
        return
      }

      // Try to parse the cookie
      try {
        const parsedCookie = JSON.parse(String(authTokenCookie))
        setCookieData(parsedCookie)
      } catch (parseError) {
        // If it's not JSON, show it as a string
        setCookieData({ raw: authTokenCookie })
        setError("Cookie is not in JSON format")
      }
    } catch (err: any) {
      setError(`Error inspecting cookie: ${err.message}`)
      setCookieData(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Cookie Inspector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>This tool inspects your Supabase auth cookie to help diagnose authentication issues.</p>

        <Button onClick={inspectCookie} disabled={loading} className="w-full">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Inspecting...
            </>
          ) : (
            "Inspect Auth Cookie"
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {cookieData && (
          <div className="space-y-2">
            <h3 className="font-medium">Cookie Content:</h3>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md overflow-x-auto">
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(cookieData, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
