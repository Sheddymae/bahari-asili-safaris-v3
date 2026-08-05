/*
# Add admin reservation-management fields to bookings

## Summary
Extends the `bookings` table so it can act as a full reservation record for
the new admin dashboard: payment tracking, pricing, booking type, generated
document flags, admin notes, and an auto-maintained `updated_at` timestamp.
`status` already exists (default 'pending'); this migration also widens the
set of values that are expected to flow through it: pending, confirmed,
cancelled, completed.

## New columns
- booking_type      text          default 'safari'  (safari | excursion | hotel | transfer | custom | contact)
- nationality        text
- pickup_location    text
- hotel_name         text
- total_price        numeric(12,2)
- payment_status     text          default 'unpaid'  (unpaid | partial | paid)
- admin_notes        text
- invoice_generated  boolean       default false
- voucher_generated  boolean       default false
- confirmed_at       timestamptz
- updated_at         timestamptz   default now(), auto-updated by trigger

## Security
- No RLS policy changes for anon/authenticated roles — the admin dashboard
  reads/writes through the Supabase service-role key (server-side only),
  which bypasses RLS entirely, so customer-facing access stays exactly as
  restrictive as it already was.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='booking_type') THEN
    ALTER TABLE bookings ADD COLUMN booking_type text NOT NULL DEFAULT 'safari';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='nationality') THEN
    ALTER TABLE bookings ADD COLUMN nationality text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='pickup_location') THEN
    ALTER TABLE bookings ADD COLUMN pickup_location text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='hotel_name') THEN
    ALTER TABLE bookings ADD COLUMN hotel_name text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='total_price') THEN
    ALTER TABLE bookings ADD COLUMN total_price numeric(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_status') THEN
    ALTER TABLE bookings ADD COLUMN payment_status text NOT NULL DEFAULT 'unpaid';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='admin_notes') THEN
    ALTER TABLE bookings ADD COLUMN admin_notes text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='invoice_generated') THEN
    ALTER TABLE bookings ADD COLUMN invoice_generated boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='voucher_generated') THEN
    ALTER TABLE bookings ADD COLUMN voucher_generated boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='confirmed_at') THEN
    ALTER TABLE bookings ADD COLUMN confirmed_at timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='updated_at') THEN
    ALTER TABLE bookings ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

-- Keep updated_at current on every row change (service-role admin updates included)
CREATE OR REPLACE FUNCTION set_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_updated_at ON bookings;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_bookings_updated_at();

-- Helpful indexes for the admin dashboard's search/filter/stat queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings (created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings (booking_type);
