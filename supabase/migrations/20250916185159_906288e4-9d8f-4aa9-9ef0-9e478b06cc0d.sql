-- Update academic_databases table structure
ALTER TABLE public.academic_databases 
ADD COLUMN database_name TEXT,
ADD COLUMN graduation_year TEXT,
ADD COLUMN year_classification TEXT;

-- Copy data from old columns to new ones
UPDATE public.academic_databases 
SET database_name = academic_year,
    graduation_year = academic_year,
    year_classification = CASE 
        WHEN semester <= 2 THEN '1st Year'
        WHEN semester <= 4 THEN '2nd Year'
        ELSE '3rd Year'
    END;

-- Make new columns not null after data migration
ALTER TABLE public.academic_databases 
ALTER COLUMN database_name SET NOT NULL,
ALTER COLUMN graduation_year SET NOT NULL,
ALTER COLUMN year_classification SET NOT NULL;

-- Drop the old academic_year column
ALTER TABLE public.academic_databases DROP COLUMN academic_year;