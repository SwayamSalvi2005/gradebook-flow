-- Drop old columns and add new mark structure for each subject
-- Subject 1
ALTER TABLE public.students DROP COLUMN IF EXISTS subject1_unit_test;
ALTER TABLE public.students DROP COLUMN IF EXISTS subject1_sem_marks;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject1_sem_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject1_ia_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject1_term_marks integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject1_viva_marks integer DEFAULT 0;

-- Subject 2
ALTER TABLE public.students DROP COLUMN IF EXISTS subject2_unit_test;
ALTER TABLE public.students DROP COLUMN IF EXISTS subject2_sem_marks;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject2_sem_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject2_ia_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject2_term_marks integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject2_viva_marks integer DEFAULT 0;

-- Subject 3
ALTER TABLE public.students DROP COLUMN IF EXISTS subject3_unit_test;
ALTER TABLE public.students DROP COLUMN IF EXISTS subject3_sem_marks;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject3_sem_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject3_ia_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject3_term_marks integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject3_viva_marks integer DEFAULT 0;

-- Subject 4
ALTER TABLE public.students DROP COLUMN IF EXISTS subject4_unit_test;
ALTER TABLE public.students DROP COLUMN IF EXISTS subject4_sem_marks;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject4_sem_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject4_ia_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject4_term_marks integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject4_viva_marks integer DEFAULT 0;

-- Subject 5
ALTER TABLE public.students DROP COLUMN IF EXISTS subject5_unit_test;
ALTER TABLE public.students DROP COLUMN IF EXISTS subject5_sem_marks;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject5_sem_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject5_ia_exam integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject5_term_marks integer DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS subject5_viva_marks integer DEFAULT 0;