"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { signOut } from "@/lib/actions/auth-actions"
import { cn } from "@/lib/utils"
import { BarChart3, Home, LogOut, Menu, Settings, User, X, FolderKanban, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase/client"

interface DashboardNavProps {
  user: {
    id: string
    email?: string | null
    full_name?: string | null
    avatar_url?: string | null
    is_super_user?: boolean
  }
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSuperUser, setIsSuperUser] = useState(!!user.is_super_user)

  useEffect(() => {
    async function checkSuperUser() {
      if (user.is_super_user === undefined) {
        try {
          const { data } = await supabase.from("profiles").select("is_super_user").eq("id", user.id).single()
          setIsSuperUser(!!data?.is_super_user)
        } catch (error) {
          console.error("Error checking super user status:", error)
        }
      }
    }

    checkSuperUser()
  }, [user.id, user.is_super_user])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ]

  // Add Admin link for super users
  if (isSuperUser) {
    navigation.push({
      name: "Admin",
      href: "/admin",
      icon: Shield,
    })
  }

  const userInitials = user.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : user.email?.[0].toUpperCase() || "U"

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard">
                <div className="flex items-center">
                  <div className="relative w-8 h-8 mr-2">
                    <Image src="/trust-impact-logo.png" alt="Trust Impact Logo" fill className="object-contain" />
                  </div>
                  <span className="text-xl font-bold hidden sm:inline-block">Impact Diagnostic</span>
                </div>
              </Link>
            </div>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Main navigation">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                      isActive
                        ? "border-primary text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || "User"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.full_name || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex w-full">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {isSuperUser && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer flex w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                    signOut()
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">{mobileMenuOpen ? "Close main menu" : "Open main menu"}</span>
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center border-l-4 py-2 pl-3 pr-4 text-base font-medium",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || "User"} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user.full_name || "User"}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="mr-2 h-5 w-5" />
                Profile
              </Link>
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Link>
              {isSuperUser && (
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="flex w-full items-center px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
