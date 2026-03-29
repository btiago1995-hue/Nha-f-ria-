-- Add plan column to companies
-- Determines feature limits enforced client-side (and eventually server-side)
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan IN ('starter', 'pro', 'enterprise'));
