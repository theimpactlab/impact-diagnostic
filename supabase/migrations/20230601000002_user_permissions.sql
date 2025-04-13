-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add organization_id and is_super_user fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_user BOOLEAN DEFAULT FALSE;

-- Add organization_id to projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Create trigger to update organization_id in projects when organization_name changes
CREATE OR REPLACE FUNCTION update_project_organization_id()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Try to find the organization by name
  SELECT id INTO org_id FROM public.organizations WHERE name = NEW.organization_name;
  
  -- If organization exists, update the organization_id
  IF org_id IS NOT NULL THEN
    NEW.organization_id = org_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_project_update
  BEFORE INSERT OR UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_organization_id();

-- Update RLS policies for organizations table
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Only super users can create organizations
CREATE POLICY "Super users can create organizations"
  ON public.organizations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- Only super users can update organizations
CREATE POLICY "Super users can update organizations"
  ON public.organizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- Only super users can delete organizations
CREATE POLICY "Super users can delete organizations"
  ON public.organizations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- Everyone can view organizations
CREATE POLICY "Everyone can view organizations"
  ON public.organizations
  FOR SELECT
  USING (true);

-- Update RLS policies for projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
  ON public.projects
  FOR SELECT
  USING (
    -- Project owner
    auth.uid() = owner_id OR 
    -- Project collaborator
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = id
    ) OR
    -- Trust Impact user
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.organizations o ON p.organization_id = o.id
      WHERE p.id = auth.uid() AND o.name = 'Trust Impact'
    ) OR
    -- User from same organization
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.organization_id = projects.organization_id
    ) OR
    -- Super user
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (
    -- Owner is the authenticated user
    auth.uid() = owner_id AND (
      -- Trust Impact user
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.organizations o ON p.organization_id = o.id
        WHERE p.id = auth.uid() AND o.name = 'Trust Impact'
      ) OR
      -- User from same organization
      EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN public.organizations o ON p.organization_id = o.id
        WHERE p.id = auth.uid() AND o.name = NEW.organization_name
      ) OR
      -- Super user
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_super_user = TRUE
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects
  FOR UPDATE
  USING (
    -- Project owner
    auth.uid() = owner_id OR
    -- Trust Impact user
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.organizations o ON p.organization_id = o.id
      WHERE p.id = auth.uid() AND o.name = 'Trust Impact'
    ) OR
    -- Super user
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects
  FOR DELETE
  USING (
    -- Project owner
    auth.uid() = owner_id OR
    -- Super user
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- Update the handle_new_user function to set default organization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_org_id UUID;
BEGIN
  -- Try to find the Trust Impact organization
  SELECT id INTO default_org_id FROM public.organizations WHERE name = 'Trust Impact';
  
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

-- Update RLS policies for other tables to respect super user permissions
-- For project_collaborators
DROP POLICY IF EXISTS "Project owners can delete collaborators" ON public.project_collaborators;
CREATE POLICY "Project owners can delete collaborators"
  ON public.project_collaborators
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- For assessments
DROP POLICY IF EXISTS "Users can delete assessments for their projects" ON public.assessments;
CREATE POLICY "Users can delete assessments for their projects"
  ON public.assessments
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR 
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = project_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );

-- For assessment_scores
DROP POLICY IF EXISTS "Users can delete scores for their assessments" ON public.assessment_scores;
CREATE POLICY "Users can delete scores for their assessments"
  ON public.assessment_scores
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT p.owner_id 
      FROM public.projects p
      JOIN public.assessments a ON p.id = a.project_id
      WHERE a.id = assessment_id
    ) OR 
    auth.uid() IN (
      SELECT pc.user_id 
      FROM public.project_collaborators pc
      JOIN public.assessments a ON pc.project_id = a.project_id
      WHERE a.id = assessment_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_super_user = TRUE
    )
  );
