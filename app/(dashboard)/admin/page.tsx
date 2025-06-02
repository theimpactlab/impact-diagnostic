import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertCircle } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Admin() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get the current user's profile directly
  const { data: currentUserProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_super_user")
    .eq("id", session.user.id)
    .single()

  if (profileError) {
    console.error("Error fetching user profile:", profileError)
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to fetch your user profile: {profileError.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check if the current user is a super user
  const isSuperUser = currentUserProfile?.is_super_user === true

  // Debug information
  console.log("Current user:", currentUserProfile)
  console.log("Is super user:", isSuperUser)

  // If not a super user, show access denied
  if (!isSuperUser) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not a Super User</AlertTitle>
              <AlertDescription>
                Your account ({currentUserProfile?.email}) is not marked as a super user. You need super user privileges
                to access the admin dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm">Your current profile:</p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(
                  {
                    id: currentUserProfile?.id,
                    email: currentUserProfile?.email,
                    full_name: currentUserProfile?.full_name,
                    is_super_user: currentUserProfile?.is_super_user,
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            <div className="space-y-2">
              <p className="font-medium">To fix this issue:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>
                  Go to the{" "}
                  <Link href="/admin/make-super-user" className="text-blue-600 underline">
                    Make Super User
                  </Link>{" "}
                  page
                </li>
                <li>Or run this SQL in Supabase:</li>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                  {`UPDATE public.profiles 
SET is_super_user = TRUE 
WHERE id = '${session.user.id}';`}
                </pre>
              </ol>
            </div>

            <Button asChild>
              <Link href="/admin/make-super-user">Make Me Super User</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get all users with their organizations
  const { data: users, error: usersError } = await supabase.from("profiles").select("*")

  // Add debugging information if no users are returned
  if (usersError) {
    console.error("Error fetching users:", usersError)
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Database Access Issue</AlertTitle>
          <AlertDescription>
            <p>Error fetching users: {usersError.message}</p>
            <p className="mt-2">This might be due to RLS policies blocking admin access.</p>
            <Link href="/admin/fix-access" className="underline font-medium">
              Click here to fix admin access
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Users Found</AlertTitle>
          <AlertDescription>
            <p>No user profiles were returned. This might be due to RLS policies.</p>
            <Link href="/admin/fix-access" className="underline font-medium">
              Click here to fix admin access
            </Link>
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
          <span className="text-sm text-muted-foreground">Logged in as {currentUserProfile?.email}</span>
          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Super User</span>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((user) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
