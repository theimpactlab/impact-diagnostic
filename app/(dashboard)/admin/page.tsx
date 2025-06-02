import { createServerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function getSuperUser(supabase: any) {
  const { data: profiles, error } = await supabase.from("profiles").select("*").eq("is_super_user", true)
  if (error) {
    console.log("error", error)
    return false
  }
  if (!profiles || profiles.length === 0) {
    return false
  }
  return true
}

export default async function Admin() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.delete({ name, ...options })
        },
      },
    },
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const isSuperUser = await getSuperUser(supabase)

  // If not a super user, show access denied
  if (!isSuperUser) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Access Denied</p>
          <p>You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  // Get all users with their organizations
  const { data: users, error: usersError } = await supabase.from("profiles").select("*")

  // Add debugging information if no users are returned
  if (usersError) {
    console.error("Error fetching users:", usersError)
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Database Access Issue</p>
          <p>Error fetching users: {usersError.message}</p>
          <p className="mt-2">This might be due to RLS policies blocking admin access.</p>
          <a href="/admin/fix-access" className="underline font-medium">
            Click here to fix admin access
          </a>
        </div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">No Users Found</p>
          <p>No user profiles were returned. This might be due to RLS policies.</p>
          <a href="/admin/fix-access" className="underline font-medium">
            Click here to fix admin access
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-2">{user.full_name}</h2>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">Role: {user.role}</p>
            <p className="text-gray-600">Super User: {user.is_super_user ? "Yes" : "No"}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
