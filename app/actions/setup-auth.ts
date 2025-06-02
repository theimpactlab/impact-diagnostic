"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function setupAuthTables() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Check if the user has admin privileges
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        error: "You must be logged in to run database setup",
      }
    }

    // Check if profiles table exists and has the correct structure
    const { data: profilesCheck, error: profilesError } = await supabase.from("profiles").select("id").limit(1).single()

    if (profilesError && !profilesError.message.includes("No rows found")) {
      console.error("Error checking profiles table:", profilesError)

      // Try to create the profiles table if it doesn't exist
      const { error: createError } = await supabase.rpc("setup_auth_tables")

      if (createError) {
        console.error("Error creating auth tables:", createError)
        return {
          error: "Failed to create auth tables. Please run the SQL setup script manually.",
          sqlScript: getAuthSetupSQL(),
        }
      }

      return {
        success: "Auth tables created successfully",
      }
    }

    return {
      success: "Auth tables already exist",
    }
  } catch (error) {
    console.error("Error in setupAuthTables:", error)
    return {
      error: `An unexpected error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      sqlScript: getAuthSetupSQL(),
    }
  }
}

function getAuthSetupSQL() {
  return `
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create stored procedure for setup
CREATE OR REPLACE FUNCTION setup_auth_tables()
RETURNS void AS $$
BEGIN
  -- Create profiles table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT
  );

  -- Create function to handle new user signup
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Drop the trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  -- Create trigger for new user signup
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END;
$$ LANGUAGE plpgsql;
  `
}
