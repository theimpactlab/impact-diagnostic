"use client"

import type React from "react"

import { useState } from "react"
import { signOut } from "@/app/actions/sign-outs"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
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
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await signOut()
      // No need to handle redirect here - server action handles it
    } catch (error: any) {
      // Check if this is a Next.js redirect (which is expected behavior)
      if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) {
        // This is actually a successful redirect, not an error
        return
      }

      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      })
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
