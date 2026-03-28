-- Final Fix for Profiles and Dashboards
-- Run this in your Supabase SQL Editor

-- 1. Insert the profile for your current user (ID found in console: 3e58ffc6-ec2d-4ab9-888e-5e6a7710c203)
INSERT INTO public.profiles (id, full_name, email, role, vacation_balance)
VALUES (
  '3e58ffc6-ec2d-4ab9-888e-5e6a7710c203', 
  'Tiago Barros', 
  'timeinvest95@gmail.com', 
  'manager', 
  22
)
ON CONFLICT (id) DO UPDATE 
SET role = 'manager', full_name = 'Tiago Barros';

-- 2. (Optional but Recommended) Add a Trigger to automatically create profiles for future users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Novo Colaborador'), 
    NEW.email, 
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on repeat
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
