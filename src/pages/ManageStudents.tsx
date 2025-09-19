import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { StudentList } from '@/components/StudentList';
import { BulkUploadPreview } from '@/components/BulkUploadPreview';
import { StudentForm } from '@/components/StudentForm';

interface Student {
  id: string;
  seat_number: number;
  roll_no?: string;
  student_name: string;
  gender?: string;
  subject1_unit_test: number;
  subject1_sem_marks: number;
  subject2_unit_test: number;
  subject2_sem_marks: number;
  subject3_unit_test: number;
  subject3_sem_marks: number;
  subject4_unit_test: number;
  subject4_sem_marks: number;
  subject5_unit_test: number;
  subject5_sem_marks: number;
  total_cgpa: number;
}

interface AcademicDatabase {
  id: string;
  database_name: string;
  graduation_year: string;
  year_classification: string;
  semester: number;
  branch: string;
  batch: string;
}

const ManageStudents = () => {
  const { user } = useAuth();
  const { databaseId } = useParams();
  const [database, setDatabase] = useState<AcademicDatabase | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  if (!user) {
    return <Navigate to="/teacher-auth" replace />;
  }

  useEffect(() => {
    if (databaseId) {
      fetchDatabase();
      fetchStudents();
    }
  }, [databaseId]);

  const fetchDatabase = async () => {
    const { data, error } = await supabase
      .from('academic_databases')
      .select('*')
      .eq('id', databaseId)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch database details",
        variant: "destructive",
      });
    } else {
      setDatabase(data);
    }
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('academic_database_id', databaseId)
      .order('roll_no', { ascending: true, nullsFirst: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } else {
      setStudents(data || []);
    }
  };

  const handleStudentSave = () => {
    fetchStudents();
    setStudentFormOpen(false);
    setEditStudent(null);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Student deleted successfully!",
      });
      fetchStudents();
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditStudent(student);
    setStudentFormOpen(true);
  };

  const handleUploadComplete = () => {
    fetchStudents();
  };

  if (!database) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Link to="/teacher-dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Students</h1>
              <div className="flex items-center space-x-4 text-muted-foreground">
                <span>{database.database_name}</span>
                <Badge variant="secondary">{database.graduation_year}</Badge>
                <span>{database.year_classification}</span>
                <Badge variant="outline">Semester {database.semester}</Badge>
                <span>{database.branch}</span>
                <span>Batch {database.batch}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => setUploadOpen(true)} 
                variant="outline" 
                size="sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload Students
              </Button>
              <Button onClick={() => {
                setEditStudent(null);
                setStudentFormOpen(true);
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Student List */}
          <StudentList
            students={students}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
          />

          {/* Student Form Dialog */}
          <StudentForm
            open={studentFormOpen}
            onOpenChange={setStudentFormOpen}
            student={editStudent}
            databaseId={databaseId!}
            onSave={handleStudentSave}
          />

          {/* Bulk Upload Dialog */}
          <BulkUploadPreview
            databaseId={databaseId!}
            onUploadComplete={handleUploadComplete}
            open={uploadOpen}
            onOpenChange={setUploadOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;