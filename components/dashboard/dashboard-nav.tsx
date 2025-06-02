"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, UserIcon, Settings, LogOut, BarChart3, FolderOpen, Home } from "lucide-react"
import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import SignOutButton from "@/components/auth/sign-out-button"

interface DashboardNavProps {
  user: {
    id: string
    email: string
    full_name?: string | null
    avatar_url?: string | null
    is_super_user?: boolean
  }
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [isSuperUser, setIsSuperUser] = useState(user.is_super_user)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderOpen },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]

  // Add admin link if user is super user
  if (isSuperUser) {
    navigation.push({ name: "Admin", href: "/admin", icon: Shield })
  }

  useEffect(() => {
    async function checkSuperUser() {
      if (user.is_super_user === undefined) {
        try {
          console.log("DashboardNav - Checking super user status for:", user.id)

          const supabase = createClientComponentClient()

          // Simple check for super user status
          const { data, error } = await supabase.from("profiles").select("is_super_user").eq("id", user.id).single()

          console.log("DashboardNav - Super user check result:", { data, error })

          if (error) {
            console.error("DashboardNav - Error checking super user status:", error)
            // If there's an error, assume not super user
            setIsSuperUser(false)
          } else {
            setIsSuperUser(!!data?.is_super_user)
            console.log("DashboardNav - Set isSuperUser to:", !!data?.is_super_user)
          }
        } catch (error) {
          console.error("DashboardNav - Unexpected error checking super user status:", error)
          setIsSuperUser(false)
        }
      }
    }

    checkSuperUser()
  }, [user.id, user.is_super_user])

  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-semibold">
            Impact Diagnostic Tool
          </Link>
          <nav className="hidden md:flex gap-6">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                  {item.name === "Admin" && (
                    <Badge variant="secondary" className="ml-2">
                      Admin
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline-block">{user.full_name || user.email}</span>
            {isSuperUser && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <Shield className="h-3 w-3" /> Admin
              </span>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user.avatar_url && (
                    <AvatarImage
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.full_name || user.email || "User avatar"}
                    />
                  )}
                  <AvatarFallback>{user.full_name?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user.full_name && <p className="font-medium">{user.full_name}</p>}
                  <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {isSuperUser && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <SignOutButton variant="ghost" className="w-full justify-start p-2">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </SignOutButton>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
