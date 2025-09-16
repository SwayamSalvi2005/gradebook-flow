-- Add roll_no column to students table
ALTER TABLE public.students 
ADD COLUMN roll_no VARCHAR(20) UNIQUE;

-- Create index for better performance on roll_no
CREATE INDEX idx_students_roll_no ON public.students(roll_no);