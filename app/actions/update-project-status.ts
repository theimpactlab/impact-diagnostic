"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function updateProjectStatus(projectId: string, status: "active" | "completed" | "on_hold") {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        error: "You must be logged in to update project status",
      }
    }

    // Update the project status
    const { error } = await supabase
      .from("projects")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", projectId)
      .eq("owner_id", session.user.id) // Ensure user owns the project

    if (error) {
      console.error("Error updating project status:", error)
      return {
        error: "Failed to update project status",
      }
    }

    // Revalidate the analytics and dashboard pages
    revalidatePath("/analytics")
    revalidatePath("/dashboard")

    return {
      success: "Project status updated successfully",
    }
  } catch (error) {
    console.error("Error in updateProjectStatus:", error)
    return {
      error: "An unexpected error occurred",
    }
  }
}
