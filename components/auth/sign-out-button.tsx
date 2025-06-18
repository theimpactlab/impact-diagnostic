"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface SignOutButtonProps {
  children?: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function SignOutButton({
  children,
  variant = "ghost",
  size = "default",
  className,
}: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({
        scope: 'global'  // Sign out from all sessions
      })

      if (error) {
        throw error
      }

      // Clear any local storage items
      localStorage.removeItem('impact-diagnostic-auth')

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })

      // Force a hard redirect to login page
      window.location.href = "/login"
    } catch (error: any) {
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
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isSigningOut}
      type="button"
    >
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </>
      )}
    </Button>
  )
}
