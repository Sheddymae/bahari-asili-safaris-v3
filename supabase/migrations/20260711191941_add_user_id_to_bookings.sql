/*
# Add user_id to bookings table + update RLS policies

## Summary
Links bookings to authenticated users while keeping guest booking support.

## Changes
1. `bookings` table:
   - Add `user_id` (uuid, nullable) — NULL for guest bookings, populated for signed-in users
   - Add `voucher_path` (text, nullable) — stores PDF file path reference
   - Add `status` (text, default 'pending') — booking status: pending/confirmed
   - DEFAULT auth.uid() so authenticated inserts auto-populate user_id

2. Security
   - Enable RLS (idempotent)
   - Authenticated users can SELECT/UPDATE/DELETE their own bookings (user_id = auth.uid())
   - Anon and authenticated can INSERT (guest bookings allowed, user_id defaults to auth.uid() if signed in)
   - Anon can NOT select bookings (privacy)
   - Service role bypasses RLS for admin use

## Important Notes
- user_id is NULLABLE to allow guest bookings
- For logged-in users, DEFAULT auth.uid() fills user_id automatically
- Guests get NULL user_id — they can't see bookings in dashboard without an account
*/

-- Add columns if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='user_id') THEN
    ALTER TABLE bookings ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='voucher_path') THEN
    ALTER TABLE bookings ADD COLUMN voucher_path text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='status') THEN
    ALTER TABLE bookings ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- SELECT: authenticated users see only their own bookings
DROP POLICY IF EXISTS "select_own_bookings" ON bookings;
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- INSERT: both anon and authenticated can insert (guest and logged-in bookings)
DROP POLICY IF EXISTS "insert_bookings" ON bookings;
CREATE POLICY "insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- UPDATE: authenticated users can update only their own bookings
DROP POLICY IF EXISTS "update_own_bookings" ON bookings;
CREATE POLICY "update_own_bookings" ON bookings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- DELETE: authenticated users can delete only their own bookings
DROP POLICY IF EXISTS "delete_own_bookings" ON bookings;
CREATE POLICY "delete_own_bookings" ON bookings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
