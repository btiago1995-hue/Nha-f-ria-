-- Allow users to update their own profile (name, avatar, etc. but NOT role)
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Allow managers/admins to update any profile (including role)
CREATE POLICY "Managers can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.check_user_is_manager());
