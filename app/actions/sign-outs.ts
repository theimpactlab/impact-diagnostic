"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function signOut() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Error signing out:", error)
      throw new Error(error.message)
    }

    // Clear any additional cookies if needed
    const cookieStore = cookies()

    // Redirect to home page
    redirect("/")
  } catch (error) {
    console.error("Unexpected error during sign out:", error)
    // Even if there's an error, redirect to home
    redirect("/")
  }
}
