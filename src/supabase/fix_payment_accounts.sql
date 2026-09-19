-- ============================================================
-- PAYMENT ACCOUNTS & MANUAL PAYMENTS SCHEMA MIGRATION
-- Run this script in the Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New query -> Paste & Run
-- ============================================================

-- 1. Create Payment Accounts Table for Super Admin / Admin management
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_type TEXT NOT NULL DEFAULT 'bank',
  bank_name TEXT NOT NULL,
  account_title TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT,
  instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/authenticated) to read active payment accounts for making payments
DROP POLICY IF EXISTS "Public can view active payment accounts" ON public.payment_accounts;
CREATE POLICY "Public can view active payment accounts" ON public.payment_accounts
FOR SELECT USING (true);

-- Allow Admins & SuperAdmins to create payment accounts
DROP POLICY IF EXISTS "Admins can insert payment accounts" ON public.payment_accounts;
CREATE POLICY "Admins can insert payment accounts" ON public.payment_accounts
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role::text IN ('admin', 'superadmin', 'super_admin') OR 'admin' = ANY(roles::text[]) OR 'superadmin' = ANY(roles::text[]) OR 'super_admin' = ANY(roles::text[]))
  )
);

-- Allow Admins & SuperAdmins to update payment accounts
DROP POLICY IF EXISTS "Admins can update payment accounts" ON public.payment_accounts;
CREATE POLICY "Admins can update payment accounts" ON public.payment_accounts
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role::text IN ('admin', 'superadmin', 'super_admin') OR 'admin' = ANY(roles::text[]) OR 'superadmin' = ANY(roles::text[]) OR 'super_admin' = ANY(roles::text[]))
  )
);

-- Allow Admins & SuperAdmins to delete payment accounts
DROP POLICY IF EXISTS "Admins can delete payment accounts" ON public.payment_accounts;
CREATE POLICY "Admins can delete payment accounts" ON public.payment_accounts
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role::text IN ('admin', 'superadmin', 'super_admin') OR 'admin' = ANY(roles::text[]) OR 'superadmin' = ANY(roles::text[]) OR 'super_admin' = ANY(roles::text[]))
  )
);

-- 3. Seed Default Payment Accounts (if table is empty)
INSERT INTO public.payment_accounts (account_type, bank_name, account_title, account_number, iban, instructions, is_active)
SELECT 'bank', 'Meezan Bank Limited', 'Muhammad Abdullah', '01010102938475', 'PK45MEZN0001010102938475', 'Please transfer via online banking or ATM. Add listing title in reference.', true
WHERE NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE bank_name = 'Meezan Bank Limited');

INSERT INTO public.payment_accounts (account_type, bank_name, account_title, account_number, iban, instructions, is_active)
SELECT 'easypaisa', 'EasyPaisa Wallet', 'Muhammad Abdullah', '03001234567', NULL, 'Transfer via EasyPaisa app or retail shop. Ensure TRX ID is clearly visible in screenshot.', true
WHERE NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE bank_name = 'EasyPaisa Wallet');

INSERT INTO public.payment_accounts (account_type, bank_name, account_title, account_number, iban, instructions, is_active)
SELECT 'jazzcash', 'JazzCash Wallet', 'Muhammad Abdullah', '03007654321', NULL, 'Send payment to JazzCash mobile account and attach payment receipt proof.', true
WHERE NOT EXISTS (SELECT 1 FROM public.payment_accounts WHERE bank_name = 'JazzCash Wallet');

-- 4. Ensure public.payments table has all necessary fields
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS sender_phone TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 7;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS package_name TEXT;

-- 5. Approval Function for Super Admin
CREATE OR REPLACE FUNCTION public.approve_payment_and_promote(
  p_payment_id UUID,
  p_admin_id UUID,
  p_status TEXT DEFAULT 'completed'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_listing_id UUID;
  v_duration INTEGER;
  v_package TEXT;
BEGIN
  -- Get payment details
  SELECT listing_id, duration_days, package_name
  INTO v_listing_id, v_duration, v_package
  FROM public.payments WHERE id = p_payment_id;

  -- Update Payment status
  UPDATE public.payments
  SET status = p_status,
      verified_by = p_admin_id,
      paid_at = CASE WHEN p_status = 'completed' THEN now() ELSE paid_at END,
      updated_at = now()
  WHERE id = p_payment_id;

  -- If completed, promote the listing
  IF p_status = 'completed' AND v_listing_id IS NOT NULL THEN
    UPDATE public.listings
    SET is_featured = true,
        featured_until = (now() + (COALESCE(v_duration, 7) || ' days')::INTERVAL),
        featured_package = COALESCE(v_package, 'Featured'),
        updated_at = now()
    WHERE id = v_listing_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_payment_and_promote(UUID, UUID, TEXT) TO authenticated, service_role;

-- 6. Reload Supabase Schema Cache
NOTIFY pgrst, 'reload schema';
