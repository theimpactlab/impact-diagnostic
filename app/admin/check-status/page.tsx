"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch, useSession } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CheckStatusPage() {
  const { session, loading } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !session) router.replace("/login")
    if (!loading && session?.profile.is_super_user) {
      apiFetch<{ users: any[] }>("admin-users.php")
        .then((d) => setUsers(d.users || []))
        .catch((e) => setError(e.message || "Failed to load users"))
    }
  }, [loading, session, router])

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
            <CardTitle className="flex items-center gap-2">
              {session?.profile.is_super_user ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" /> Super User Active
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" /> Not a Super User
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Signed in as {session?.user.email}</p>
            <p className="text-sm text-muted-foreground mt-2">
              is_super_user: {String(!!session?.profile.is_super_user)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users Visible ({users?.length ?? (error ? "error" : "…")})</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <ul className="text-sm space-y-1 max-h-48 overflow-auto">
                {(users || []).map((u) => (
                  <li key={u.id} className="flex justify-between">
                    <span>{u.email}</span>
                    <span className="text-muted-foreground">{u.is_super_user ? "super user" : "user"}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
