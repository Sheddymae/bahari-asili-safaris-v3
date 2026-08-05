/*
# Reservation schema alignment — reservation_status, document URLs, storage bucket

## Summary
Brings the `bookings` table in line with the finalized reservation schema:
renames the ambiguous `status` column to `reservation_status` (its actual
meaning — booking lifecycle state, not e.g. HTTP/payment status), adds
`invoice_url` / `voucher_url` so generated PDFs can be persisted and
downloaded from the admin dashboard instead of only being emailed, and adds
check constraints so invalid values are rejected at the database level
rather than silently accepted.

Also creates the `documents` storage bucket (public read) that
`lib/supabase-admin.ts` uploads generated invoice/voucher PDFs into.

## Changes
1. Rename `bookings.status` -> `bookings.reservation_status` (safe no-op if
   already renamed, and safe if the column doesn't exist yet at all — in
   which case it's created fresh with the right name).
2. Add `invoice_url text`, `voucher_url text`.
3. Add CHECK constraints on `reservation_status` and `payment_status`.
4. Rename the old `idx_bookings_status` index to match.
5. Create the `documents` storage bucket + public-read policy.

## Security
- No RLS policy changes for anon/authenticated roles on `bookings` — the
  admin dashboard reads/writes exclusively through the service-role key,
  which bypasses RLS.
- `documents` bucket: public SELECT (so emailed/shared PDF links work
  without auth), INSERT/UPDATE/DELETE restricted to service_role only.
*/

-- 1. Rename status -> reservation_status (or create it if bookings predates any status column)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='status')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='reservation_status') THEN
    ALTER TABLE bookings RENAME COLUMN status TO reservation_status;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='reservation_status') THEN
    ALTER TABLE bookings ADD COLUMN reservation_status text NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- 2. Document URLs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='invoice_url') THEN
    ALTER TABLE bookings ADD COLUMN invoice_url text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='voucher_url') THEN
    ALTER TABLE bookings ADD COLUMN voucher_url text;
  END IF;
END $$;

-- 3. Check constraints (guarded — skip if already present, and normalize any
--    unexpected legacy values to 'pending'/'unpaid' first so the constraint
--    doesn't fail to apply against existing rows)
UPDATE bookings SET reservation_status = 'pending'
  WHERE reservation_status IS NULL OR reservation_status NOT IN ('pending','confirmed','cancelled','completed');

UPDATE bookings SET payment_status = 'unpaid'
  WHERE payment_status IS NULL OR payment_status NOT IN ('unpaid','partial','paid');

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='bookings' AND constraint_name='bookings_reservation_status_check'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_reservation_status_check
      CHECK (reservation_status IN ('pending','confirmed','cancelled','completed'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='bookings' AND constraint_name='bookings_payment_status_check'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_payment_status_check
      CHECK (payment_status IN ('unpaid','partial','paid'));
  END IF;
END $$;

-- 4. Reindex under the new column name
DROP INDEX IF EXISTS idx_bookings_status;
CREATE INDEX IF NOT EXISTS idx_bookings_reservation_status ON bookings (reservation_status);

-- 5. Storage bucket for generated invoice/voucher PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_documents" ON storage.objects;
CREATE POLICY "public_read_documents" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'documents');

-- No INSERT/UPDATE/DELETE policy for anon/authenticated is intentional:
-- only the service-role key (used server-side in the admin API routes)
-- can write to this bucket, and service_role bypasses RLS entirely.
