-- ============================================================
-- USER-LINKED PAYMENT ACCOUNTS SCHEMA MIGRATION
-- Run this script in the Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New query -> Paste & Run
-- ============================================================

-- 1. Create or Update Payment Accounts Table with user_id
CREATE TABLE IF NOT EXISTS public.payment_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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

-- Ensure user_id column exists if table pre-existed
ALTER TABLE public.payment_accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_payment_accounts_user_id ON public.payment_accounts(user_id);

-- 2. Configure Row Level Security (RLS)
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

-- Allow SELECT
DROP POLICY IF EXISTS "Public can view active payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Users can view own or active payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Allow all to select payment accounts" ON public.payment_accounts;
CREATE POLICY "Allow all to select payment accounts" ON public.payment_accounts
FOR SELECT USING (true);

-- Allow INSERT
DROP POLICY IF EXISTS "Admins can insert payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Users can insert own payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Allow authenticated to insert payment accounts" ON public.payment_accounts;
CREATE POLICY "Allow authenticated to insert payment accounts" ON public.payment_accounts
FOR INSERT WITH CHECK (true);

-- Allow UPDATE
DROP POLICY IF EXISTS "Admins can update payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Users can update own payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Allow users to update payment accounts" ON public.payment_accounts;
CREATE POLICY "Allow users to update payment accounts" ON public.payment_accounts
FOR UPDATE USING (true);

-- Allow DELETE
DROP POLICY IF EXISTS "Admins can delete payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Users can delete own payment accounts" ON public.payment_accounts;
DROP POLICY IF EXISTS "Allow users to delete payment accounts" ON public.payment_accounts;
CREATE POLICY "Allow users to delete payment accounts" ON public.payment_accounts
FOR DELETE USING (true);

-- 3. Ensure payments table has all proof & approval fields
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS sender_name TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS sender_phone TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS duration_days INTEGER DEFAULT 7;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS package_name TEXT;

-- 4. Reload Schema Cache
NOTIFY pgrst, 'reload schema';
