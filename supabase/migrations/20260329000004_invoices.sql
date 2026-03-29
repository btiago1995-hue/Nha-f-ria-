-- Electronic invoices issued by Servyx Labs to Nha Féria customers
CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id      UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  payment_id      UUID REFERENCES public.payments(id),
  iud             TEXT UNIQUE NOT NULL,          -- 45-char eFatura unique ID
  doc_number      TEXT NOT NULL,                 -- e.g. FTE 2026/00001
  doc_type        TEXT NOT NULL DEFAULT 'FTE',   -- FTE, NCE, etc.
  amount_net      INTEGER NOT NULL,              -- base without IVA (CVE)
  amount_tax      INTEGER NOT NULL,              -- IVA amount (CVE)
  amount_gross    INTEGER NOT NULL,              -- total with IVA (CVE)
  receiver_nif    TEXT,                          -- customer company NIF
  receiver_name   TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'authorized', 'rejected', 'contingency')),
  efatura_response JSONB,
  xml_content     TEXT,                          -- the signed XML (archived)
  issued_at       TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence for document numbering per year
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their company invoices" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND company_id = invoices.company_id AND role = 'admin'
    )
  );
