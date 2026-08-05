/*
# Create bookings table — Bahari Asili Safaris

## Summary
Creates the `bookings` table to store all safari and excursion booking requests
submitted through the website. This is a single-tenant, no-auth setup so the
anon-key frontend can read and write freely.

## New Tables

### bookings
| Column          | Type        | Notes                                    |
|-----------------|-------------|------------------------------------------|
| id              | bigserial   | Auto-incrementing primary key            |
| booking_ref     | text        | Unique voucher ref, format BA-YYYYMMDD-N |
| first_name      | text        | Client first name                        |
| last_name       | text        | Client last name                         |
| email           | text        | Client email address                     |
| whatsapp        | text        | Client WhatsApp number                   |
| adults          | integer     | Number of adult travelers (≥1)           |
| children        | integer     | Number of children under 10              |
| arrival_date    | date        | Planned arrival/start date               |
| safari_name     | text        | Selected safari or excursion name        |
| message         | text        | Optional free-text request               |
| email_sent      | boolean     | Whether confirmation email was sent      |
| created_at      | timestamptz | Timestamp of booking submission          |

## Security
- RLS enabled.
- Anon + authenticated can INSERT and SELECT (no user accounts — public booking form).
- No UPDATE or DELETE policies (bookings are immutable once submitted).
*/

CREATE TABLE IF NOT EXISTS bookings (
  id           BIGSERIAL    PRIMARY KEY,
  booking_ref  TEXT         NOT NULL UNIQUE,
  first_name   TEXT         NOT NULL,
  last_name    TEXT         NOT NULL,
  email        TEXT         NOT NULL,
  whatsapp     TEXT,
  adults       INTEGER      NOT NULL DEFAULT 1,
  children     INTEGER      NOT NULL DEFAULT 0,
  arrival_date DATE         NOT NULL,
  safari_name  TEXT         NOT NULL,
  message      TEXT,
  email_sent   BOOLEAN      NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);
