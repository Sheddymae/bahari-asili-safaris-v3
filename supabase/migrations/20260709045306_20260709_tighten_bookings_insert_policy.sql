/*
# Tighten bookings INSERT RLS policy

## Summary
Replaces the unrestricted `WITH CHECK (true)` on `anon_insert_bookings` with a
meaningful predicate that validates submitted data. This prevents abuse (spam,
malformed refs, past dates, empty required fields) while still allowing the
public booking form to insert rows without requiring user auth.

## Changes
- DROP + recreate `anon_insert_bookings` policy with a data-validity check:
  - `first_name` and `last_name` must be non-empty strings
  - `email` must match a basic address pattern
  - `safari_name` must be non-empty
  - `booking_ref` must match the BA-YYYYMMDD-N format
  - `arrival_date` must be today or in the future
  - `adults` must be at least 1
  - `children` must be non-negative

## Security
- Replaces always-true INSERT policy with a constrained predicate.
- SELECT policy (USING true) is intentionally public — no change needed.
*/

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    first_name  <> ''
    AND last_name   <> ''
    AND email       ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND safari_name <> ''
    AND booking_ref ~ '^BA-[0-9]{8}-[0-9]+$'
    AND arrival_date >= current_date
    AND adults  >= 1
    AND children >= 0
  );
