"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function diagnoseAuthSetup() {
  try {
    const supabase = createServerActionClient({ cookies })

    const diagnostics = {
      profilesTable: false,
      handleNewUserFunction: false,
      authTrigger: false,
      testProfileCreation: false,
      errors: [] as string[],
      details: {} as any,
    }

    // Check if profiles table exists and its structure
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .limit(1)

      if (profilesError) {
        diagnostics.errors.push(`Profiles table error: ${profilesError.message}`)
      } else {
        diagnostics.profilesTable = true
        diagnostics.details.profilesCount = profilesData?.length || 0
      }
    } catch (error) {
      diagnostics.errors.push(`Profiles table check failed: ${error}`)
    }

    // Check if we can query system tables (this requires elevated privileges)
    try {
      // Try to check if the function exists
      const { data: functionData, error: functionError } = await supabase.rpc("check_function_exists", {
        function_name: "handle_new_user",
      })

      if (functionError) {
        diagnostics.errors.push(`Function check error: ${functionError.message}`)
      } else {
        diagnostics.handleNewUserFunction = functionData
      }
    } catch (error) {
      // If we can't check the function directly, we'll provide SQL to check manually
      diagnostics.errors.push("Cannot check function existence - need manual verification")
    }

    // Try to check trigger existence
    try {
      const { data: triggerData, error: triggerError } = await supabase.rpc("check_trigger_exists", {
        trigger_name: "on_auth_user_created",
        table_name: "users",
        schema_name: "auth",
      })

      if (triggerError) {
        diagnostics.errors.push(`Trigger check error: ${triggerError.message}`)
      } else {
        diagnostics.authTrigger = triggerData
      }
    } catch (error) {
      diagnostics.errors.push("Cannot check trigger existence - need manual verification")
    }

    return {
      success: true,
      diagnostics,
      needsManualCheck: diagnostics.errors.length > 0,
    }
  } catch (error) {
    console.error("Error in diagnoseAuthSetup:", error)
    return {
      error: `Diagnostic failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function fixAuthSetup() {
  const sqlScript = `
-- Step 1: Check if profiles table exists and create if needed
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  organization_id UUID,
  is_super_user BOOLEAN DEFAULT FALSE
);

-- Step 2: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 4: Create or replace the function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 5: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 6: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create helper functions for diagnostics
CREATE OR REPLACE FUNCTION public.check_function_exists(function_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' AND p.proname = function_name
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.check_trigger_exists(trigger_name TEXT, table_name TEXT, schema_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.triggers 
    WHERE trigger_name = $1 
    AND event_object_table = $2 
    AND event_object_schema = $3
  );
END;
$$;

-- Step 8: Test the setup by checking if everything exists
SELECT 
  'Profiles table exists' as check_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) as result
UNION ALL
SELECT 
  'Handle new user function exists' as check_name,
  public.check_function_exists('handle_new_user') as result
UNION ALL
SELECT 
  'Auth trigger exists' as check_name,
  public.check_trigger_exists('on_auth_user_created', 'users', 'auth') as result;
`

  return {
    sqlScript,
    message: "Run this comprehensive SQL script in your Supabase SQL Editor to fix all auth setup issues.",
  }
}

export async function testUserCreation() {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get current user count
    const { count: beforeCount } = await supabase.from("profiles").select("*", { count: "exact", head: true })

    // Try to create a test user (this won't actually work from server action, but we can check the setup)
    const testEmail = `test-${Date.now()}@example.com`

    return {
      success: true,
      message: `Ready to test. Current profiles count: ${beforeCount}. Try registering with email: ${testEmail}`,
      testEmail,
      profilesCount: beforeCount,
    }
  } catch (error) {
    return {
      error: `Test preparation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
