/*
# Tighten bookings INSERT policy

## Problem
The previous `insert_bookings` policy used `WITH CHECK (true)`, allowing any caller
(anon or authenticated) to insert a booking row with any user_id — including spoofing
another user's ID.

## Fix
Replace the single permissive policy with two targeted policies:

1. `insert_booking_authenticated` — authenticated users may only insert rows where
   user_id matches their own session (`auth.uid()`). The column DEFAULT already fills
   this automatically, so legitimate inserts (which omit user_id) pass naturally.

2. `insert_booking_anon` — the anon role may only insert rows where user_id IS NULL
   (guest bookings). This prevents an unauthenticated caller from claiming ownership
   of a row by passing an arbitrary UUID.

## Security improvement
- Authenticated users cannot forge another user's user_id.
- Anonymous callers cannot claim ownership of a booking.
- Guest bookings (user_id = NULL) are still fully supported.
*/

DROP POLICY IF EXISTS "insert_bookings" ON bookings;

-- Authenticated users: user_id must equal their own session ID (DEFAULT auth.uid() satisfies this automatically)
DROP POLICY IF EXISTS "insert_booking_authenticated" ON bookings;
CREATE POLICY "insert_booking_authenticated" ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Anonymous (guest) users: user_id must be NULL — no ownership claimed
DROP POLICY IF EXISTS "insert_booking_anon" ON bookings;
CREATE POLICY "insert_booking_anon" ON bookings FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);
