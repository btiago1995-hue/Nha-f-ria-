-- RPC called immediately after a new admin signs up.
-- Creates their company and elevates their profile to role='admin'.
-- Runs as SECURITY DEFINER to bypass the RLS policy that blocks role self-elevation.

CREATE OR REPLACE FUNCTION public.setup_company_admin(
  p_company_name TEXT,
  p_full_name     TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_company_id UUID;
  v_user_id    UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.companies (name)
  VALUES (p_company_name)
  RETURNING id INTO v_company_id;

  UPDATE public.profiles
  SET
    role       = 'admin',
    company_id = v_company_id,
    full_name  = COALESCE(NULLIF(p_full_name, ''), full_name)
  WHERE id = v_user_id;

  RETURN v_company_id;
END;
$$;
