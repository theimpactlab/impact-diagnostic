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

    console.log("Updating project:", projectId, "to status:", status, "for user:", session.user.id)

    // First, let's check if the project exists and get its current data
    const { data: existingProject, error: fetchError } = await supabase
      .from("projects")
      .select("id, name, owner_id")
      .eq("id", projectId)
      .single()

    if (fetchError) {
      console.error("Error fetching project:", fetchError)
      return {
        error: `Project not found: ${fetchError.message}`,
      }
    }

    if (!existingProject) {
      return {
        error: "Project not found",
      }
    }

    console.log("Found project:", existingProject)

    // Check if user owns the project
    if (existingProject.owner_id !== session.user.id) {
      return {
        error: "You don't have permission to update this project",
      }
    }

    // Try to update the project status
    const updateData: any = { status }

    // Try to include updated_at if the column exists
    try {
      updateData.updated_at = new Date().toISOString()
    } catch (e) {
      // If updated_at doesn't exist, just update status
      console.log("updated_at column may not exist, updating status only")
    }

    const { data, error } = await supabase.from("projects").update(updateData).eq("id", projectId).select()

    if (error) {
      console.error("Error updating project status:", error)

      // If updated_at column doesn't exist, try again without it
      if (error.message.includes("updated_at")) {
        console.log("Retrying without updated_at column...")
        const { data: retryData, error: retryError } = await supabase
          .from("projects")
          .update({ status })
          .eq("id", projectId)
          .select()

        if (retryError) {
          return {
            error: `Database error: ${retryError.message}`,
          }
        }

        console.log("Successfully updated project (without updated_at):", retryData)
      } else {
        // Check if it's a column doesn't exist error
        if (error.message.includes("column") && error.message.includes("status")) {
          return {
            error: "Database needs to be updated. The 'status' column doesn't exist in the projects table.",
          }
        }

        return {
          error: `Database error: ${error.message}`,
        }
      }
    } else {
      console.log("Successfully updated project:", data)
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
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
