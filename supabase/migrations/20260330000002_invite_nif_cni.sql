-- Allow managers to pre-fill NIF and CNI when creating an invite
-- These are pre-populated on the worker's acceptance page (InvitePage)
ALTER TABLE public.company_invites ADD COLUMN IF NOT EXISTS nif TEXT;
ALTER TABLE public.company_invites ADD COLUMN IF NOT EXISTS cni TEXT;
