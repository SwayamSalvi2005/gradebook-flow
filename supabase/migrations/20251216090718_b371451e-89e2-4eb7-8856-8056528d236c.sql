-- Drop old columns and add new ones matching the Excel format
ALTER TABLE students
DROP COLUMN IF EXISTS subject1_sem_exam,
DROP COLUMN IF EXISTS subject1_ia_exam,
DROP COLUMN IF EXISTS subject1_term_marks,
DROP COLUMN IF EXISTS subject1_viva_marks,
DROP COLUMN IF EXISTS subject2_sem_exam,
DROP COLUMN IF EXISTS subject2_ia_exam,
DROP COLUMN IF EXISTS subject2_term_marks,
DROP COLUMN IF EXISTS subject2_viva_marks,
DROP COLUMN IF EXISTS subject3_sem_exam,
DROP COLUMN IF EXISTS subject3_ia_exam,
DROP COLUMN IF EXISTS subject3_term_marks,
DROP COLUMN IF EXISTS subject3_viva_marks,
DROP COLUMN IF EXISTS subject4_sem_exam,
DROP COLUMN IF EXISTS subject4_ia_exam,
DROP COLUMN IF EXISTS subject4_term_marks,
DROP COLUMN IF EXISTS subject4_viva_marks,
DROP COLUMN IF EXISTS subject5_sem_exam,
DROP COLUMN IF EXISTS subject5_ia_exam,
DROP COLUMN IF EXISTS subject5_term_marks,
DROP COLUMN IF EXISTS subject5_viva_marks;

-- Add new columns matching Excel format
-- Math IV (with TW)
ALTER TABLE students
ADD COLUMN math_iv_se INTEGER DEFAULT 0,
ADD COLUMN math_iv_ia INTEGER DEFAULT 0,
ADD COLUMN math_iv_total INTEGER DEFAULT 0,
ADD COLUMN math_iv_tw INTEGER DEFAULT 0;

-- Algo
ALTER TABLE students
ADD COLUMN algo_se INTEGER DEFAULT 0,
ADD COLUMN algo_ia INTEGER DEFAULT 0,
ADD COLUMN algo_total INTEGER DEFAULT 0;

-- DBMS
ALTER TABLE students
ADD COLUMN dbms_se INTEGER DEFAULT 0,
ADD COLUMN dbms_ia INTEGER DEFAULT 0,
ADD COLUMN dbms_total INTEGER DEFAULT 0;

-- OS
ALTER TABLE students
ADD COLUMN os_se INTEGER DEFAULT 0,
ADD COLUMN os_ia INTEGER DEFAULT 0,
ADD COLUMN os_total INTEGER DEFAULT 0;

-- Micro
ALTER TABLE students
ADD COLUMN micro_se INTEGER DEFAULT 0,
ADD COLUMN micro_ia INTEGER DEFAULT 0,
ADD COLUMN micro_total INTEGER DEFAULT 0;

-- Result (Pass/Fail)
ALTER TABLE students
ADD COLUMN result VARCHAR(5) DEFAULT 'P';