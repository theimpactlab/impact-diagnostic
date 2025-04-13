"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { getCookie } from "cookies-next"
import { supabase } from "@/lib/supabase/client"
import { RefreshCw } from "lucide-react"

export default function SimpleAuthFix() {
  const [loading, setLoading] = useState(false)

  const fixAuth = async () => {
    setLoading(true)
    try {
      // Get the auth token cookie directly
      const authTokenCookie = getCookie("sb-ujjbzummjplrvhwybiqp-auth-token")

      if (!authTokenCookie) {
        alert("No auth token cookie found. Please log in again.")
        return
      }

      // Parse the cookie to get the access token and refresh token
      try {
        const parsedToken = JSON.parse(String(authTokenCookie))

        if (!parsedToken.access_token || !parsedToken.refresh_token) {
          alert("Invalid auth token format. Please log in again.")
          return
        }

        // Set the session manually
        const { error } = await supabase.auth.setSession({
          access_token: parsedToken.access_token,
          refresh_token: parsedToken.refresh_token,
        })

        if (error) {
          alert(`Error setting session: ${error.message}`)
          return
        }

        // Force reload the page
        window.location.reload()
      } catch (parseError) {
        alert("Could not parse auth token. Please log in again.")
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={fixAuth} disabled={loading} variant="outline" size="sm">
      {loading ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Fixing...
        </>
      ) : (
        "Quick Auth Fix"
      )}
    </Button>
  )
}
