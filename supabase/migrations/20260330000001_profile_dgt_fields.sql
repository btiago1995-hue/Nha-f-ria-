-- Add fields required for the DGT Annual Leave Map (Mapa Anual de Férias)
-- Código Laboral CV, Art. 160.º — deadline: 30 April each year
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cni        TEXT;         -- Cartão Nacional de Identificação
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hire_date  DATE;         -- Data de admissão
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title  TEXT;         -- Função / categoria profissional
