-- Add personal NIF to employee profiles
-- Required for payroll and DGT fiscal reporting
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nif TEXT;
