-- Create tables for the Impact Diagnostic Assessment

-- Enable RLS
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-super-secret-jwt-secret';

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  organization_name TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL
);

-- Create project collaborators table
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL
);

-- Create assessment scores table
CREATE TABLE IF NOT EXISTS public.assessment_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  question_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id, domain, question_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: Users can CRUD their own projects
CREATE POLICY "Users can view their own projects" 
  ON public.projects FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = id
    )
  );

CREATE POLICY "Users can create their own projects" 
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects FOR DELETE USING (auth.uid() = owner_id);

-- Project collaborators: Project owners can CRUD collaborators
CREATE POLICY "Users can view collaborators for their projects" 
  ON public.project_collaborators FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR 
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = project_id
    )
  );

CREATE POLICY "Project owners can add collaborators" 
  ON public.project_collaborators FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Project owners can update collaborators" 
  ON public.project_collaborators FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

CREATE POLICY "Project owners can delete collaborators" 
  ON public.project_collaborators FOR DELETE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    )
  );

-- Assessments: Project owners and collaborators can CRUD assessments
CREATE POLICY "Users can view assessments for their projects" 
  ON public.assessments FOR SELECT USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR 
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = project_id
    )
  );

CREATE POLICY "Users can create assessments for their projects" 
  ON public.assessments FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR 
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = project_id
    )
  );

CREATE POLICY "Users can update assessments for their projects" 
  ON public.assessments FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR 
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = project_id
    )
  );

CREATE POLICY "Users can delete assessments for their projects" 
  ON public.assessments FOR DELETE USING (
    auth.uid() IN (
      SELECT owner_id FROM public.projects WHERE id = project_id
    ) OR 
    auth.uid() IN (
      SELECT user_id FROM public.project_collaborators WHERE project_id = project_id
    )
  );

-- Assessment scores: Project owners and collaborators can CRUD scores
CREATE POLICY "Users can view scores for their assessments" 
  ON public.assessment_scores FOR SELECT USING (
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
    )
  );

CREATE POLICY "Users can create scores for their assessments" 
  ON public.assessment_scores FOR INSERT WITH CHECK (
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
    )
  );

CREATE POLICY "Users can update scores for their assessments" 
  ON public.assessment_scores FOR UPDATE USING (
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
    )
  );

CREATE POLICY "Users can delete scores for their assessments" 
  ON public.assessment_scores FOR DELETE USING (
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
    )
  );

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
