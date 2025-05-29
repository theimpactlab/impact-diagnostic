"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function checkDatabaseSetup() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        error: "You must be logged in to check database setup",
      }
    }

    // Try to select a project with status column to see if it exists
    const { data, error } = await supabase.from("projects").select("id, status").limit(1)

    if (error) {
      console.error("Database check error:", error)

      if (error.message.includes("column") && error.message.includes("status")) {
        return {
          needsSetup: true,
          error: "The 'status' column doesn't exist in the projects table. Please run the database migration.",
        }
      }

      return {
        error: `Database error: ${error.message}`,
      }
    }

    return {
      needsSetup: false,
      success: "Database is properly configured",
    }
  } catch (error) {
    console.error("Error checking database setup:", error)
    return {
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function addStatusColumn() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Note: This won't work directly from the client due to RLS
    // This is just for reference - the user needs to run this in Supabase SQL editor
    const sqlCommand = `
      -- Add status column to projects table
      ALTER TABLE projects 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
      
      -- Add a check constraint to ensure valid status values
      ALTER TABLE projects 
      ADD CONSTRAINT IF NOT EXISTS projects_status_check 
      CHECK (status IN ('active', 'completed', 'on_hold'));
      
      -- Update existing projects to have 'active' status
      UPDATE projects 
      SET status = 'active' 
      WHERE status IS NULL;
    `

    return {
      sqlCommand,
      message: "Please run this SQL command in your Supabase SQL editor to add the status column.",
    }
  } catch (error) {
    console.error("Error generating SQL:", error)
    return {
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
