"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { LogOut, RefreshCw } from "lucide-react"

export default function CleanLogout() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      // Sign out from Supabase
      await supabase.auth.signOut()

      // Clear all cookies (this is a brute force approach)
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      // Redirect to login page
      window.location.href = "/login"
    } catch (err) {
      console.error("Logout error:", err)
      alert("Error during logout. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clean Logout</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          This will completely sign you out, clear all cookies, and redirect you to the login page. Use this if you're
          experiencing persistent authentication issues.
        </p>

        <Button onClick={handleLogout} disabled={loading} variant="destructive" className="w-full">
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Logging Out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Complete Logout & Clear Cookies
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
