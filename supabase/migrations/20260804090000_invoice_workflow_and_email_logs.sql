/*
# Invoice workflow & email send history

## Summary
Adds invoice-level tracking on top of the existing `reservation_status`
(pending/confirmed/cancelled/completed booking lifecycle). These are
deliberately separate concepts: `reservation_status` answers "where is this
trip in its lifecycle", `invoice_status` answers "where is the money".
Also adds an `email_logs` table so every admin-triggered email (quote,
reminder, resend, custom) has a visible send history.

## New bookings columns
- invoice_status   text  default 'draft'  (draft|quoted|sent|confirmed|paid|partially_paid|overdue|cancelled)
- invoice_number   text  unique, nullable until first generated
- deposit_amount   numeric(12,2)
- amount_paid      numeric(12,2) default 0
- balance_due      numeric(12,2) — kept in sync by the app layer on every payment write
- payment_method   text
- payment_date     timestamptz
- due_date         date

## New table: email_logs
One row per admin-triggered email attempt (confirmation/quote/reminder/
custom/resend), so admins can see what was sent, when, and whether it
succeeded — and use that as the basis for a "resend" action.

## Security
- No RLS policy changes for anon/authenticated — both tables are only
  written to via the service-role key from admin API routes.
- `email_logs` has RLS enabled with no anon/authenticated policies at all,
  so it's only reachable through the service-role key server-side.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='invoice_status') THEN
    ALTER TABLE bookings ADD COLUMN invoice_status text NOT NULL DEFAULT 'draft';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='invoice_number') THEN
    ALTER TABLE bookings ADD COLUMN invoice_number text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='bookings_invoice_number_key') THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_invoice_number_key UNIQUE (invoice_number);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='deposit_amount') THEN
    ALTER TABLE bookings ADD COLUMN deposit_amount numeric(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='amount_paid') THEN
    ALTER TABLE bookings ADD COLUMN amount_paid numeric(12,2) NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='balance_due') THEN
    ALTER TABLE bookings ADD COLUMN balance_due numeric(12,2);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_method') THEN
    ALTER TABLE bookings ADD COLUMN payment_method text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='payment_date') THEN
    ALTER TABLE bookings ADD COLUMN payment_date timestamptz;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='due_date') THEN
    ALTER TABLE bookings ADD COLUMN due_date date;
  END IF;
END $$;

-- Normalize any unexpected values before adding the constraint
UPDATE bookings SET invoice_status = 'draft'
  WHERE invoice_status IS NULL OR invoice_status NOT IN ('draft','quoted','sent','confirmed','paid','partially_paid','overdue','cancelled');

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='bookings' AND constraint_name='bookings_invoice_status_check'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_invoice_status_check
      CHECK (invoice_status IN ('draft','quoted','sent','confirmed','paid','partially_paid','overdue','cancelled'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bookings_invoice_status ON bookings (invoice_status);

-- Email send history
CREATE TABLE IF NOT EXISTS email_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id bigint REFERENCES bookings(id) ON DELETE CASCADE,
  email_type text NOT NULL, -- confirmation | quote | payment_reminder | pre_departure_reminder | review_request | custom
  subject text NOT NULL,
  recipient text NOT NULL,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON email_logs (booking_id);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
-- Intentionally no anon/authenticated policies — service-role only (admin API routes).
