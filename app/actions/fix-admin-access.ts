"use server"

export async function getAdminAccessFix() {
  const sqlScript = `
-- =============================================================================
-- FIX ADMIN ACCESS TO VIEW ALL USERS
-- This script fixes RLS policies to allow super users to see all profiles
-- =============================================================================

-- Step 1: Update RLS policies to allow super users to see all profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new RLS policies that allow super users to see everything
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

CREATE POLICY "Users can update profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

CREATE POLICY "Users can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- Step 2: Also allow super users to delete profiles if needed
CREATE POLICY "Super users can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- Step 3: Verify the current user is marked as super user
-- (This will show if your account has is_super_user = true)
SELECT 
  id,
  email,
  full_name,
  is_super_user,
  'Current user super status' as note
FROM public.profiles 
WHERE id = auth.uid();

-- Step 4: If needed, manually set the first user as super user
-- Uncomment the next lines if your account is not marked as super user
-- UPDATE public.profiles 
-- SET is_super_user = TRUE 
-- WHERE email = 'your-email@example.com';  -- Replace with your actual email

-- =============================================================================
-- VERIFICATION
-- After running this script, super users should be able to see all profiles
-- =============================================================================
`

  return {
    sqlScript,
    message: "Admin access fix script generated. This will allow super users to see all profiles.",
  }
}
