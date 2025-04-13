-- Fix the relationship between profiles and organizations
-- First, ensure the organizations table has the correct structure
ALTER TABLE IF EXISTS public.organizations
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create a default organization if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.organizations WHERE name = 'Trust Impact') THEN
    INSERT INTO public.organizations (name) VALUES ('Trust Impact');
  END IF;
END
$$;

-- Make sure the super user flag is properly set
ALTER TABLE public.profiles ALTER COLUMN is_super_user SET DEFAULT false;

-- Create a function to set the first user as super user
CREATE OR REPLACE FUNCTION set_first_user_as_super()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE is_super_user = true) THEN
    UPDATE public.profiles SET is_super_user = true WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to set the first user as super user
DROP TRIGGER IF EXISTS set_first_super_user ON public.profiles;
CREATE TRIGGER set_first_super_user
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_first_user_as_super();

-- Update the handle_new_user function to properly set organization_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Try to find the Trust Impact organization
  SELECT id INTO default_org_id FROM public.organizations WHERE name = 'Trust Impact' LIMIT 1;
  
  -- If Trust Impact organization doesn't exist, create it
  IF default_org_id IS NULL THEN
    INSERT INTO public.organizations (name) VALUES ('Trust Impact') RETURNING id INTO default_org_id;
  END IF;
  
  -- Insert the new profile with organization_id
  INSERT INTO public.profiles (id, full_name, avatar_url, email, organization_id)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email, default_org_id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
