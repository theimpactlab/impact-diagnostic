import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CheckStatusPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get the current user's profile with super user status
  const { data: currentUser, error: currentUserError } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_super_user")
    .eq("id", session.user.id)
    .single()

  // Try to get all users to test super user access
  const { data: allUsers, error: allUsersError } = await supabase.from("profiles").select("id, email, is_super_user")

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <Link href="/admin" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Admin
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Super User Status Check</h1>
        <p className="text-muted-foreground">Verify your super user status and permissions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUserError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Fetching Profile</AlertTitle>
                <AlertDescription>{currentUserError.message}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Super User Status:</span>
                  {currentUser?.is_super_user ? (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" /> Enabled
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" /> Disabled
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Profile Details:</p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(
                      {
                        id: currentUser?.id,
                        email: currentUser?.email,
                        full_name: currentUser?.full_name,
                        is_super_user: currentUser?.is_super_user,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Admin Access:</span>
                {currentUser?.is_super_user ? (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Granted
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" /> Denied
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Can View All Users:</span>
                {allUsersError ? (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" /> Error
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" /> Yes ({allUsers?.length || 0} users)
                  </span>
                )}
              </div>

              {allUsersError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error Fetching All Users</AlertTitle>
                  <AlertDescription>{allUsersError.message}</AlertDescription>
                </Alert>
              )}

              {!allUsersError && allUsers && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Users Found:</p>
                  <div className="bg-gray-100 p-3 rounded text-xs overflow-y-auto max-h-40">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="text-left">Email</th>
                          <th className="text-right">Super User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.email}</td>
                            <td className="text-right">{user.is_super_user ? "Yes" : "No"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
