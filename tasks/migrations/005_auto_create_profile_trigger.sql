-- Migration: Auto-create profile on user signup
-- This trigger automatically creates a profile when a new user signs up
-- This bypasses RLS issues that occur when the client tries to insert before session is established

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- This allows the function to bypass RLS
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url, badge, created_at)
  VALUES (
    NEW.id,
    -- Generate a temporary username from email or random string
    COALESCE(
      LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.email, '@', 1), '[^a-z0-9]', '', 'g')),
      'user'
    ) || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 6),
    -- Use email prefix as display name or 'Nouveau membre'
    COALESCE(
      SPLIT_PART(NEW.email, '@', 1),
      'Nouveau membre'
    ),
    -- Avatar URL from OAuth metadata if available
    NEW.raw_user_meta_data->>'avatar_url',
    'member',
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;  -- Don't fail if profile already exists

  RETURN NEW;
END;
$$;

-- Trigger that fires after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Add policy to allow users to update their own profile (for setting username/display_name after signup)
-- This is already in 002_complete_rls_security.sql but let's make sure it exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;
