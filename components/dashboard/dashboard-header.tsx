"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Shield, User } from "lucide-react"
import { signOut } from "@/app/actions/signout"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface DashboardHeaderProps {
  isSuperUser?: boolean
  userName?: string
}

export default function DashboardHeader({ isSuperUser = false, userName }: DashboardHeaderProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      const result = await signOut()

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to sign out. Please try again.",
          variant: "destructive",
        })
      }
      // If successful, the server action will redirect
    } catch (error: any) {
      // Check if this is a Next.js redirect (which is expected behavior)
      if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) {
        // This is a successful redirect, not an error
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        })
        return
      }

      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Impact Diagnostic Assessment</h1>
        <p className="text-muted-foreground mt-1">Measure and improve your organization's social impact</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{userName ? `Hello, ${userName}` : "My Account"}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          {isSuperUser && (
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Shield className="h-4 w-4 mr-2" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? "Signing out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
