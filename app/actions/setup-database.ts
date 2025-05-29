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

    // Try to select a project with status and updated_at columns to see if they exist
    const { data, error } = await supabase.from("projects").select("id, status, updated_at").limit(1)

    if (error) {
      console.error("Database check error:", error)

      if (error.message.includes("column")) {
        const missingColumns = []
        if (error.message.includes("status")) missingColumns.push("status")
        if (error.message.includes("updated_at")) missingColumns.push("updated_at")

        return {
          needsSetup: true,
          missingColumns,
          error: `Missing columns in projects table: ${missingColumns.join(", ")}. Please run the database migration.`,
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

export async function addMissingColumns() {
  try {
    // Note: This won't work directly from the client due to RLS
    // This is just for reference - the user needs to run this in Supabase SQL editor
    const sqlCommand = `
-- Add missing columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add a check constraint to ensure valid status values
ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS projects_status_check 
CHECK (status IN ('active', 'completed', 'on_hold'));

-- Update existing projects to have 'active' status and current timestamp
UPDATE projects 
SET status = 'active', updated_at = NOW()
WHERE status IS NULL OR updated_at IS NULL;

-- Create a trigger to automatically update updated_at when a row is modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    `

    return {
      sqlCommand,
      message: "Please run this SQL command in your Supabase SQL editor to add the missing columns.",
    }
  } catch (error) {
    console.error("Error generating SQL:", error)
    return {
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
