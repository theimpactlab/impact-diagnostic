-- The "Users can update their own profile" policy (20230601000000) has no
-- column restrictions, so any authenticated user could set is_super_user or
-- organization_id on their own row. Guard privileged columns with a trigger:
-- only existing super users may change them. Service-role / SQL-editor
-- sessions (auth.uid() IS NULL) stay unaffected, as do the signup triggers.
--
-- NOTE: migrations in this repo are not applied automatically. Run this SQL
-- against the production Supabase project (SQL Editor or supabase db push).

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    NEW.is_super_user IS DISTINCT FROM OLD.is_super_user
    OR NEW.organization_id IS DISTINCT FROM OLD.organization_id
  )
  AND auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_super_user = TRUE
  ) THEN
    RAISE EXCEPTION 'Not authorized to change privileged profile fields';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;

CREATE TRIGGER prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
