"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle, RefreshCw, Server } from "lucide-react"

export default function AuthDebug() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [checkingServer, setCheckingServer] = useState(false)
  const [authState, setAuthState] = useState<{
    session: any | null
    user: any | null
    error: string | null
  }>({
    session: null,
    user: null,
    error: null,
  })
  const [serverAuthState, setServerAuthState] = useState<{
    status: string | null
    message: string | null
    user: any | null
    session: any | null
    cookies: string[] | null
    error: string | null
  }>({
    status: null,
    message: null,
    user: null,
    session: null,
    cookies: null,
    error: null,
  })

  const checkAuth = async () => {
    setLoading(true)
    try {
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        setAuthState({
          session: null,
          user: null,
          error: `Session error: ${sessionError.message}`,
        })
        return
      }

      // Check user
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        setAuthState({
          session: sessionData.session,
          user: null,
          error: `User error: ${userError.message}`,
        })
        return
      }

      setAuthState({
        session: sessionData.session,
        user: userData.user,
        error: null,
      })
    } catch (err: any) {
      setAuthState({
        session: null,
        user: null,
        error: `Unexpected error: ${err.message}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const checkServerAuth = async () => {
    setCheckingServer(true)
    try {
      const response = await fetch("/api/auth-debug")
      const data = await response.json()

      if (response.ok) {
        setServerAuthState({
          status: data.status,
          message: data.message,
          user: data.user,
          session: data.session,
          cookies: data.cookies,
          error: null,
        })
      } else {
        setServerAuthState({
          status: "error",
          message: data.message,
          user: null,
          session: null,
          cookies: data.cookies,
          error: data.message,
        })
      }
    } catch (err: any) {
      setServerAuthState({
        status: "error",
        message: null,
        user: null,
        session: null,
        cookies: null,
        error: `API request error: ${err.message}`,
      })
    } finally {
      setCheckingServer(false)
    }
  }

  const refreshSession = async () => {
    setRefreshing(true)
    try {
      // Try to refresh the session
      const { data, error } = await supabase.auth.refreshSession()

      if (error) {
        setAuthState((prev) => ({
          ...prev,
          error: `Refresh error: ${error.message}`,
        }))
        return
      }

      setAuthState({
        session: data.session,
        user: data.user,
        error: null,
      })

      // Force reload the page to ensure all components pick up the new session
      window.location.reload()
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        error: `Refresh error: ${err.message}`,
      }))
    } finally {
      setRefreshing(false)
    }
  }

  // Check auth on component mount
  useEffect(() => {
    checkAuth()
    checkServerAuth()
  }, [])

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Client-Side Authentication Status
            <Button variant="outline" size="sm" onClick={checkAuth} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Checking authentication...</span>
            </div>
          ) : authState.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{authState.error}</AlertDescription>
            </Alert>
          ) : !authState.session ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Authenticated</AlertTitle>
              <AlertDescription>No active session found. Please log in again.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Authenticated</AlertTitle>
                <AlertDescription className="text-green-700">You are currently authenticated.</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Session Information</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <p>
                    <strong>User ID:</strong> {authState.user?.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {authState.user?.email}
                  </p>
                  <p>
                    <strong>Session Expires:</strong>{" "}
                    {authState.session?.expires_at
                      ? new Date(authState.session.expires_at * 1000).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={refreshSession} disabled={refreshing} className="w-full">
                  {refreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Refreshing Session...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Authentication Session
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Use this if you're experiencing authentication issues
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Server-Side Authentication Status
            <Button variant="outline" size="sm" onClick={checkServerAuth} disabled={checkingServer}>
              <Server className={`h-4 w-4 mr-2`} />
              Check Server
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {checkingServer ? (
            <div className="flex items-center justify-center p-6">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Checking server authentication...</span>
            </div>
          ) : serverAuthState.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Server Authentication Error</AlertTitle>
              <AlertDescription>{serverAuthState.error}</AlertDescription>
            </Alert>
          ) : !serverAuthState.status ? (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Checked</AlertTitle>
              <AlertDescription>Click "Check Server" to verify server-side authentication.</AlertDescription>
            </Alert>
          ) : serverAuthState.status === "authenticated" ? (
            <div className="space-y-4">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Server Authenticated</AlertTitle>
                <AlertDescription className="text-green-700">Your session is valid on the server.</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Server Session Information</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  <p>
                    <strong>User ID:</strong> {serverAuthState.user?.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {serverAuthState.user?.email}
                  </p>
                  <p>
                    <strong>Session Expires:</strong>{" "}
                    {serverAuthState.session?.expires_at
                      ? new Date(serverAuthState.session.expires_at * 1000).toLocaleString()
                      : "Unknown"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Cookies Found ({serverAuthState.cookies?.length || 0})</h3>
                <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                  {serverAuthState.cookies && serverAuthState.cookies.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {serverAuthState.cookies.map((cookie, index) => (
                        <li key={index}>{cookie}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No cookies found</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Authenticated on Server</AlertTitle>
              <AlertDescription>
                {serverAuthState.message || "Your session is not valid on the server."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
