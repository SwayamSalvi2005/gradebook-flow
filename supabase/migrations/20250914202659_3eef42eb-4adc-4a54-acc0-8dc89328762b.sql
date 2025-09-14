-- Create enum for branches
CREATE TYPE public.branch_type AS ENUM (
  'Computer Eng.', 
  'Electronics and Telecom', 
  'Information Technology', 
  'Electronics and Computer Science', 
  'Electrical'
);

CREATE TYPE public.gender_type AS ENUM ('Male', 'Female', 'Other');

-- Create academic_databases table
CREATE TABLE public.academic_databases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 6),
  branch branch_type NOT NULL,
  batch TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(academic_year, semester, branch, batch)
);

-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  academic_database_id UUID REFERENCES public.academic_databases(id) ON DELETE CASCADE NOT NULL,
  seat_number INTEGER NOT NULL CHECK (seat_number >= 10000 AND seat_number <= 99999),
  student_name TEXT NOT NULL,
  gender gender_type,
  subject1_unit_test INTEGER DEFAULT 0 CHECK (subject1_unit_test >= 0 AND subject1_unit_test <= 20),
  subject1_sem_marks INTEGER DEFAULT 0 CHECK (subject1_sem_marks >= 0 AND subject1_sem_marks <= 90),
  subject2_unit_test INTEGER DEFAULT 0 CHECK (subject2_unit_test >= 0 AND subject2_unit_test <= 20),
  subject2_sem_marks INTEGER DEFAULT 0 CHECK (subject2_sem_marks >= 0 AND subject2_sem_marks <= 90),
  subject3_unit_test INTEGER DEFAULT 0 CHECK (subject3_unit_test >= 0 AND subject3_unit_test <= 20),
  subject3_sem_marks INTEGER DEFAULT 0 CHECK (subject3_sem_marks >= 0 AND subject3_sem_marks <= 90),
  subject4_unit_test INTEGER DEFAULT 0 CHECK (subject4_unit_test >= 0 AND subject4_unit_test <= 20),
  subject4_sem_marks INTEGER DEFAULT 0 CHECK (subject4_sem_marks >= 0 AND subject4_sem_marks <= 90),
  subject5_unit_test INTEGER DEFAULT 0 CHECK (subject5_unit_test >= 0 AND subject5_unit_test <= 20),
  subject5_sem_marks INTEGER DEFAULT 0 CHECK (subject5_sem_marks >= 0 AND subject5_sem_marks <= 90),
  total_cgpa DECIMAL(4,2) DEFAULT 0.00 CHECK (total_cgpa >= 0.00 AND total_cgpa <= 10.00),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(academic_database_id, seat_number)
);

-- Create profiles table for teachers
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'teacher',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.academic_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for academic_databases
CREATE POLICY "Teachers can view their own databases" 
ON public.academic_databases 
FOR SELECT 
USING (auth.uid() = created_by);

CREATE POLICY "Teachers can create databases" 
ON public.academic_databases 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Teachers can update their own databases" 
ON public.academic_databases 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Teachers can delete their own databases" 
ON public.academic_databases 
FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for students
CREATE POLICY "Teachers can view students in their databases" 
ON public.students 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.academic_databases 
    WHERE id = students.academic_database_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Anyone can view students for student portal" 
ON public.students 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can insert students in their databases" 
ON public.students 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.academic_databases 
    WHERE id = students.academic_database_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Teachers can update students in their databases" 
ON public.students 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.academic_databases 
    WHERE id = students.academic_database_id 
    AND created_by = auth.uid()
  )
);

CREATE POLICY "Teachers can delete students in their databases" 
ON public.students 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.academic_databases 
    WHERE id = students.academic_database_id 
    AND created_by = auth.uid()
  )
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_academic_databases_updated_at
  BEFORE UPDATE ON public.academic_databases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();