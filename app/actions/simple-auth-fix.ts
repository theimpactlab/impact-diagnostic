"use server"

export async function getSimpleAuthFix() {
  const sqlScript = `
-- =============================================================================
-- COMPREHENSIVE AUTH SETUP FIX
-- Run this entire script in your Supabase SQL Editor
-- =============================================================================

-- Step 1: Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert new user profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW()
  );
  
  -- Always return NEW to continue the auth process
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Step 2: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Create diagnostic helper functions
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

-- Step 5: Ensure RLS is properly configured
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, anon, authenticated, service_role;

-- Grant execute permission on functions (correct syntax)
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_function_exists(TEXT) TO postgres, anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.check_trigger_exists(TEXT, TEXT, TEXT) TO postgres, anon, authenticated, service_role;

-- Step 7: Test the setup
SELECT 
  'Setup verification' as test_name,
  CASE 
    WHEN public.check_function_exists('handle_new_user') 
    AND public.check_trigger_exists('on_auth_user_created', 'users', 'auth')
    THEN 'SUCCESS: All components are in place'
    ELSE 'FAILED: Some components are missing'
  END as result;

-- Step 8: Show current setup status
SELECT 
  'Function exists' as component,
  public.check_function_exists('handle_new_user') as status
UNION ALL
SELECT 
  'Trigger exists' as component,
  public.check_trigger_exists('on_auth_user_created', 'users', 'auth') as status
UNION ALL
SELECT 
  'Profiles table exists' as component,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) as status;

-- =============================================================================
-- SETUP COMPLETE
-- After running this script:
-- 1. Go back to /admin/auth-setup and run diagnostics again
-- 2. Test user registration
-- 3. Check that new users get profile records created automatically
-- =============================================================================
`

  return {
    sqlScript,
    message: "Complete auth setup fix script generated. Run this in your Supabase SQL Editor.",
  }
}
