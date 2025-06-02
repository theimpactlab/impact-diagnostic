import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Shield } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function AdminPage() {
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

  // Debug information
  console.log("Current user:", currentUser)
  console.log("Current user error:", currentUserError)

  // If there was an error fetching the current user
  if (currentUserError) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching User Profile</AlertTitle>
          <AlertDescription>
            <p>Error: {currentUserError.message}</p>
            <p className="mt-2">Please check your database connection and permissions.</p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check if the user is a super user
  const isSuperUser = currentUser?.is_super_user === true
  console.log("Is super user:", isSuperUser)

  // If not a super user, show access denied
  if (!isSuperUser) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            <p>You do not have permission to access the admin dashboard.</p>
            <p className="mt-2">Your account ({currentUser?.email}) is not marked as a super user in the database.</p>
          </AlertDescription>
        </Alert>

        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h2 className="text-lg font-medium mb-2">Debug Information</h2>
          <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
            {JSON.stringify(
              {
                userId: session.user.id,
                email: currentUser?.email,
                is_super_user: currentUser?.is_super_user,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    )
  }

  // If the user is a super user, fetch all users
  const { data: allUsers, error: allUsersError } = await supabase.from("profiles").select("*")

  // If there was an error fetching all users
  if (allUsersError) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Users</AlertTitle>
          <AlertDescription>
            <p>Error: {allUsersError.message}</p>
            <p className="mt-2">
              You are a super user, but there was an error fetching all users. This might be due to RLS policies.
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Logged in as {currentUser?.email}</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Shield className="h-3 w-3" /> Super User
          </span>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management ({allUsers?.length || 0} users)</CardTitle>
        </CardHeader>
        <CardContent>
          {allUsers && allUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border p-4">
                  <h2 className="text-xl font-semibold mb-2">{user.full_name || "No Name"}</h2>
                  <p className="text-gray-600">Email: {user.email}</p>
                  <p className="text-gray-600">
                    Super User:{" "}
                    <span className={`${user.is_super_user ? "text-green-600 font-medium" : "text-gray-500"}`}>
                      {user.is_super_user ? "Yes" : "No"}
                    </span>
                  </p>
                  <p className="text-gray-600 text-sm mt-2">ID: {user.id}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No users found</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
