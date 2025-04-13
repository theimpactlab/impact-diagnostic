import { createArrayFormatServerClient } from "@/lib/supabase/array-format-server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ServerArrayFormatTest() {
  let userData = null
  let error = null

  try {
    const supabase = createArrayFormatServerClient()
    const { data, error: authError } = await supabase.auth.getUser()

    if (authError) {
      throw authError
    }

    userData = data.user
  } catch (err: any) {
    error = err.message
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Array Format Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>This tests if the server can authenticate you with the array-formatted cookie.</p>

        {error ? (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        ) : userData ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
            <p className="font-medium">Success! Server authenticated with array format:</p>
            <p>User ID: {userData.id}</p>
            <p>Email: {userData.email}</p>
          </div>
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
            <p>No user data found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
