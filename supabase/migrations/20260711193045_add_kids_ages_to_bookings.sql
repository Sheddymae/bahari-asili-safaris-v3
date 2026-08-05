/*
# Add kids_ages column to bookings table

## Change
- Adds `kids_ages` (integer[], nullable) to the `bookings` table.
- Stores the age of each child as an ordered array matching the children count.
- e.g. 2 children aged 5 and 9 → [5, 9]
- NULL when children = 0 or booking predates this migration.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'kids_ages'
  ) THEN
    ALTER TABLE bookings ADD COLUMN kids_ages integer[];
  END IF;
END $$;
