-- Add notification preference columns to profiles
-- notify_on_leave_submitted: manager/admin receives email when a worker submits a leave request
-- notify_on_leave_decided:   worker receives email when their leave is approved or rejected

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_on_leave_submitted BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_on_leave_decided   BOOLEAN NOT NULL DEFAULT true;
