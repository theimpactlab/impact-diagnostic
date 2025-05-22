"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updatePassword(newPassword: string) {
  const supabase = createServerSupabaseClient()

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/profile")
    return { success: true }
  } catch (error: any) {
    console.error("Error updating password:", error)
    return { success: false, error: error.message || "An unexpected error occurred" }
  }
}
