-- Remove the existing seat number check constraint and add a new one for 6-digit numbers
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_seat_number_check;

-- Add new constraint for 6-digit seat numbers (100000 to 999999)
ALTER TABLE students ADD CONSTRAINT students_seat_number_check 
CHECK (seat_number >= 100000 AND seat_number <= 999999);

-- Ensure seat numbers are unique globally
DROP INDEX IF EXISTS idx_students_seat_number_unique;
CREATE UNIQUE INDEX idx_students_seat_number_unique ON students(seat_number);