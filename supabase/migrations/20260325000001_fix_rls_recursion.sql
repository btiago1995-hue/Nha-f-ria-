-- Fix for infinite recursion in profiles policy
-- Run this in your Supabase SQL Editor

-- 1. Create a security definer function to check roles without triggering RLS recursively
CREATE OR REPLACE FUNCTION public.check_user_is_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('manager', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic policies
DROP POLICY IF EXISTS "Managers can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can handle all requests" ON public.leave_requests;

-- 3. Re-create the policies using the function
CREATE POLICY "Managers can view all profiles" ON public.profiles
  FOR SELECT USING (public.check_user_is_manager());

CREATE POLICY "Managers can handle all requests" ON public.leave_requests
  FOR ALL USING (public.check_user_is_manager());

-- 4. Ensure the basic "view own" policies still exist
-- (Already in initial_schema but good to keep here for context if needed)
