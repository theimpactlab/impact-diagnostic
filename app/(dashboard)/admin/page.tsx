"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiFetch, useSession } from "@/lib/api"
import UsersManagement from "@/components/admin/users-management"
import OrganizationsManagement from "@/components/admin/organizations-management"
import ProjectsManagement from "@/components/admin/projects-management"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AdminPage() {
  const { session, loading } = useSession()
  const router = useRouter()
  const [data, setData] = useState<{
    users: any[]
    organisations: any[]
    projects: any[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !session) router.replace("/login")
    if (!loading && session && session.profile.is_super_user) {
      Promise.all([
        apiFetch<{ users: any[] }>("admin-users.php"),
        apiFetch<{ organisations: any[] }>("organisations.php"),
        apiFetch<{ projects: any[] }>("projects.php"),
      ])
        .then(([u, o, p]) =>
          setData({ users: u.users || [], organisations: o.organisations || [], projects: p.projects || [] })
        )
        .catch((e) => setError(e.message || "Failed to load admin data"))
    }
  }, [loading, session, router])

  if (loading) return <p className="p-8 text-muted-foreground">Loading…</p>

  if (!session?.profile.is_super_user) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access the admin dashboard.</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!data) return <p className="p-8 text-muted-foreground">Loading admin data…</p>

  const orgs = data.organisations.map((o: any) => ({ id: String(o.id), name: o.name }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Logged in as: {session.user.email} (Super User)
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-8">
        <TabsList>
          <TabsTrigger value="users">Users ({data.users.length})</TabsTrigger>
          <TabsTrigger value="organizations">Organizations ({orgs.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({data.projects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersManagement users={data.users} organizations={orgs} />
        </TabsContent>

        <TabsContent value="organizations">
          <OrganizationsManagement organizations={orgs} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsManagement projects={data.projects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
