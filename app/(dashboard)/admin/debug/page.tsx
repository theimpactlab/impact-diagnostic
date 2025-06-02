import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminDebugPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  // Get profile
  let profile = null
  let profileError = null

  if (session) {
    const result = await supabase
      .from("profiles")
      .select("id, email, full_name, is_super_user, organization_id, created_at")
      .eq("id", session.user.id)
      .single()

    profile = result.data
    profileError = result.error
  }

  // Try to get all users (this will fail if not super user)
  let allUsers = null
  let allUsersError = null

  if (profile?.is_super_user) {
    const result = await supabase.from("profiles").select("id, email, is_super_user")
    allUsers = result.data
    allUsersError = result.error
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Debug Information</h1>
        <p className="text-muted-foreground">Diagnostic information for admin access</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {session ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Session Status
            </CardTitle>
            <CardDescription>Authentication session information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Has Session:</span>
                <Badge variant={session ? "default" : "destructive"}>{session ? "Yes" : "No"}</Badge>
              </div>
              {session && (
                <>
                  <div className="flex justify-between">
                    <span>User ID:</span>
                    <span className="text-sm font-mono">{session.user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-sm">{session.user.email}</span>
                  </div>
                </>
              )}
              {sessionError && <div className="text-red-600 text-sm">Error: {sessionError.message}</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {profile ? (
                profile.is_super_user ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Profile Status
            </CardTitle>
            <CardDescription>User profile and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Profile Found:</span>
                <Badge variant={profile ? "default" : "destructive"}>{profile ? "Yes" : "No"}</Badge>
              </div>
              {profile && (
                <>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Full Name:</span>
                    <span className="text-sm">{profile.full_name || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Super User:</span>
                    <Badge variant={profile.is_super_user ? "default" : "secondary"}>
                      {profile.is_super_user ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Organization ID:</span>
                    <span className="text-sm">{profile.organization_id || "None"}</span>
                  </div>
                </>
              )}
              {profileError && <div className="text-red-600 text-sm">Error: {profileError.message}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {allUsers ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : profile?.is_super_user ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Admin Access Test
            </CardTitle>
            <CardDescription>Test if you can access admin-only data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Can Access All Users:</span>
                <Badge variant={allUsers ? "default" : "destructive"}>
                  {allUsers ? `Yes (${allUsers.length} users)` : "No"}
                </Badge>
              </div>

              {allUsersError && (
                <div className="text-red-600 text-sm">
                  <strong>Error accessing users:</strong> {allUsersError.message}
                </div>
              )}

              {allUsers && (
                <div>
                  <h4 className="font-medium mb-2">All Users in System:</h4>
                  <div className="space-y-1">
                    {allUsers.map((user) => (
                      <div key={user.id} className="flex justify-between text-sm">
                        <span>{user.email}</span>
                        <Badge variant={user.is_super_user ? "default" : "secondary"} className="text-xs">
                          {user.is_super_user ? "Super User" : "User"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!profile?.is_super_user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-yellow-800 text-sm">
                    You are not marked as a super user. To fix this, run this SQL in your Supabase SQL Editor:
                  </p>
                  <pre className="bg-yellow-100 p-2 rounded text-xs mt-2 overflow-x-auto">
                    {`UPDATE public.profiles 
SET is_super_user = TRUE 
WHERE email = '${profile?.email}';`}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
