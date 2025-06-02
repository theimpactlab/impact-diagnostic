"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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
  const supabase = createClientComponentClient()

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error("Error signing out:", error)
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        })
        // Redirect to home page
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleSignOut} disabled={isSigningOut}>
      {children || (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          {isSigningOut ? "Signing out..." : "Sign out"}
        </>
      )}
    </Button>
  )
}
