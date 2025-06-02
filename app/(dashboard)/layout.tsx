import type React from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })

  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Get the current user's profile with super user status
  const { data: currentUser } = await supabase
    .from("profiles")
    .select("id, email, full_name, is_super_user, avatar_url")
    .eq("id", session.user.id)
    .single()

  const isSuperUser = currentUser?.is_super_user === true

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="font-semibold">
              Impact Diagnostic Tool
            </a>
            <nav className="hidden md:flex gap-6">
              <a href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </a>
              <a href="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Projects
              </a>
              <a href="/analytics" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Analytics
              </a>
              {isSuperUser && (
                <a href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  Admin
                </a>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {currentUser?.full_name || currentUser?.email}
              </span>
              {isSuperUser && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Shield className="h-3 w-3" /> Admin
                </span>
              )}
            </div>
            <Avatar className="h-8 w-8">
              {currentUser?.avatar_url && (
                <AvatarImage
                  src={currentUser.avatar_url || "/placeholder.svg"}
                  alt={currentUser.full_name || currentUser.email || "User avatar"}
                />
              )}
              <AvatarFallback>{currentUser?.full_name?.[0] || currentUser?.email?.[0] || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
