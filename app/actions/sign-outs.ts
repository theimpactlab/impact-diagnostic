"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signOut() {
  try {
    const supabase = await createServerSupabaseClient()

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      throw new Error(error.message)
    }

    // Redirect to login page
    redirect("/login")
  } catch (error: any) {
    // Check if this is a Next.js redirect (which is expected behavior)
    if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) {
      // This is expected behavior from redirect(), re-throw it
      throw error
    }

    console.error("Unexpected error during sign out:", error)
    // Even if there's an error, redirect to login
    redirect("/login")
  }
}
