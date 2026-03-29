-- Add NIF (Número de Identificação Fiscal) to companies
-- Required for eFatura electronic invoicing (Decreto-lei 79/2020)
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS nif TEXT;
