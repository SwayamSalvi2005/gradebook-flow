-- First, drop the existing constraint completely
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_seat_number_check;

-- Update the existing seat number to be 6-digit
UPDATE students SET seat_number = 112345 WHERE seat_number = 12345;

-- Now add the constraint for 6-digit numbers
ALTER TABLE students ADD CONSTRAINT students_seat_number_check 
CHECK (seat_number >= 100000 AND seat_number <= 999999);

-- Ensure seat numbers are unique globally  
DROP INDEX IF EXISTS idx_students_seat_number_unique;
CREATE UNIQUE INDEX idx_students_seat_number_unique ON students(seat_number);