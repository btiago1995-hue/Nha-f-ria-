-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'A Minha Empresa',
  sector TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the default placeholder company used by existing profiles
INSERT INTO public.companies (id, name)
VALUES ('00000000-0000-0000-0000-000000000000', 'A Minha Empresa')
ON CONFLICT (id) DO NOTHING;

-- updated_at trigger
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Anyone in the same company can read it
CREATE POLICY "Company members can view their company" ON public.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND company_id = companies.id
    )
  );

-- Only admins can update their company
CREATE POLICY "Admins can update their company" ON public.companies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND company_id = companies.id
        AND role = 'admin'
    )
  );
