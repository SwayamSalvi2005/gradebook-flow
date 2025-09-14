import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  User,
  BookOpen,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

type GenderType = 'Male' | 'Female' | 'Other';

interface Student {
  id: string;
  seat_number: number;
  student_name: string;
  gender?: GenderType;
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
  academic_year: string;
  semester: number;
  branch: string;
  batch: string;
}

const ManageStudents = () => {
  const { user } = useAuth();
  const { databaseId } = useParams();
  const [database, setDatabase] = useState<AcademicDatabase | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({
    seat_number: '',
    student_name: '',
    gender: '' as GenderType | '',
    subject1_unit_test: 0,
    subject1_sem_marks: 0,
    subject2_unit_test: 0,
    subject2_sem_marks: 0,
    subject3_unit_test: 0,
    subject3_sem_marks: 0,
    subject4_unit_test: 0,
    subject4_sem_marks: 0,
    subject5_unit_test: 0,
    subject5_sem_marks: 0,
    total_cgpa: 0.00
  });

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
      .order('seat_number');

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

  const resetForm = () => {
    setStudentForm({
      seat_number: '',
      student_name: '',
      gender: '',
      subject1_unit_test: 0,
      subject1_sem_marks: 0,
      subject2_unit_test: 0,
      subject2_sem_marks: 0,
      subject3_unit_test: 0,
      subject3_sem_marks: 0,
      subject4_unit_test: 0,
      subject4_sem_marks: 0,
      subject5_unit_test: 0,
      subject5_sem_marks: 0,
      total_cgpa: 0.00
    });
    setEditStudent(null);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('students')
      .insert([
        {
          ...studentForm,
          seat_number: parseInt(studentForm.seat_number),
          academic_database_id: databaseId,
          gender: studentForm.gender || null
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Student added successfully!",
      });
      setAddStudentOpen(false);
      resetForm();
      fetchStudents();
    }

    setLoading(false);
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    
    setLoading(true);

    const { error } = await supabase
      .from('students')
      .update({
        ...studentForm,
        seat_number: parseInt(studentForm.seat_number),
        gender: studentForm.gender || null
      })
      .eq('id', editStudent.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Student updated successfully!",
      });
      resetForm();
      fetchStudents();
    }

    setLoading(false);
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

  const openEditDialog = (student: Student) => {
    setEditStudent(student);
    setStudentForm({
      seat_number: student.seat_number.toString(),
      student_name: student.student_name,
      gender: student.gender || '',
      subject1_unit_test: student.subject1_unit_test,
      subject1_sem_marks: student.subject1_sem_marks,
      subject2_unit_test: student.subject2_unit_test,
      subject2_sem_marks: student.subject2_sem_marks,
      subject3_unit_test: student.subject3_unit_test,
      subject3_sem_marks: student.subject3_sem_marks,
      subject4_unit_test: student.subject4_unit_test,
      subject4_sem_marks: student.subject4_sem_marks,
      subject5_unit_test: student.subject5_unit_test,
      subject5_sem_marks: student.subject5_sem_marks,
      total_cgpa: student.total_cgpa
    });
  };

  const downloadTemplate = () => {
    const csvContent = `Seat Number,Student Name,Gender,Subject1_UnitTest,Subject1_SemMarks,Subject2_UnitTest,Subject2_SemMarks,Subject3_UnitTest,Subject3_SemMarks,Subject4_UnitTest,Subject4_SemMarks,Subject5_UnitTest,Subject5_SemMarks,Total_CGPA
12345,John Doe,Male,18,85,19,88,17,82,20,90,18,87,8.75`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const calculateTotal = (student: Student) => {
    return student.subject1_unit_test + student.subject1_sem_marks +
           student.subject2_unit_test + student.subject2_sem_marks +
           student.subject3_unit_test + student.subject3_sem_marks +
           student.subject4_unit_test + student.subject4_sem_marks +
           student.subject5_unit_test + student.subject5_sem_marks;
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
                <span>{database.academic_year}</span>
                <Badge variant="secondary">Semester {database.semester}</Badge>
                <span>{database.branch}</span>
                <span>Batch {database.batch}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={downloadTemplate} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Students
              </Button>
              <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Enter student details and marks for all subjects
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="seat_number">Seat Number</Label>
                        <Input
                          id="seat_number"
                          type="number"
                          min="10000"
                          max="99999"
                          value={studentForm.seat_number}
                          onChange={(e) => setStudentForm({ ...studentForm, seat_number: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="student_name">Student Name</Label>
                        <Input
                          id="student_name"
                          value={studentForm.student_name}
                          onChange={(e) => setStudentForm({ ...studentForm, student_name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender (Optional)</Label>
                      <Select
                        value={studentForm.gender}
                        onValueChange={(value) => setStudentForm({ ...studentForm, gender: value as GenderType })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {[1, 2, 3, 4, 5].map((num) => (
                      <div key={num} className="space-y-2">
                        <Label className="font-medium">Subject {num}</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`subject${num}_unit_test`}>Unit Test (Max: 20)</Label>
                            <Input
                              id={`subject${num}_unit_test`}
                              type="number"
                              min="0"
                              max="20"
                              value={studentForm[`subject${num}_unit_test` as keyof typeof studentForm]}
                              onChange={(e) => setStudentForm({ 
                                ...studentForm, 
                                [`subject${num}_unit_test`]: parseInt(e.target.value) || 0 
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`subject${num}_sem_marks`}>Semester Marks (Max: 90)</Label>
                            <Input
                              id={`subject${num}_sem_marks`}
                              type="number"
                              min="0"
                              max="90"
                              value={studentForm[`subject${num}_sem_marks` as keyof typeof studentForm]}
                              onChange={(e) => setStudentForm({ 
                                ...studentForm, 
                                [`subject${num}_sem_marks`]: parseInt(e.target.value) || 0 
                              })}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2">
                      <Label htmlFor="total_cgpa">Total CGPA</Label>
                      <Input
                        id="total_cgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={studentForm.total_cgpa}
                        onChange={(e) => setStudentForm({ ...studentForm, total_cgpa: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setAddStudentOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Student'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {students.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Students Added</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add students manually or upload a CSV file to get started
                </p>
                <div className="flex space-x-2">
                  <Button onClick={() => setAddStudentOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{student.student_name}</span>
                      <Badge variant="outline">{student.seat_number}</Badge>
                    </CardTitle>
                    <CardDescription>
                      CGPA: {student.total_cgpa} | Total: {calculateTotal(student)}/550
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {student.gender && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Gender: </span>
                        <span className="font-medium">{student.gender}</span>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditDialog(student)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteStudent(student.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Student Dialog */}
        <Dialog open={!!editStudent} onOpenChange={() => resetForm()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update student details and marks
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_seat_number">Seat Number</Label>
                  <Input
                    id="edit_seat_number"
                    type="number"
                    min="10000"
                    max="99999"
                    value={studentForm.seat_number}
                    onChange={(e) => setStudentForm({ ...studentForm, seat_number: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_student_name">Student Name</Label>
                  <Input
                    id="edit_student_name"
                    value={studentForm.student_name}
                    onChange={(e) => setStudentForm({ ...studentForm, student_name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_gender">Gender (Optional)</Label>
                <Select
                  value={studentForm.gender}
                  onValueChange={(value) => setStudentForm({ ...studentForm, gender: value as GenderType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="space-y-2">
                  <Label className="font-medium">Subject {num}</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit_subject${num}_unit_test`}>Unit Test (Max: 20)</Label>
                      <Input
                        id={`edit_subject${num}_unit_test`}
                        type="number"
                        min="0"
                        max="20"
                        value={studentForm[`subject${num}_unit_test` as keyof typeof studentForm]}
                        onChange={(e) => setStudentForm({ 
                          ...studentForm, 
                          [`subject${num}_unit_test`]: parseInt(e.target.value) || 0 
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit_subject${num}_sem_marks`}>Semester Marks (Max: 90)</Label>
                      <Input
                        id={`edit_subject${num}_sem_marks`}
                        type="number"
                        min="0"
                        max="90"
                        value={studentForm[`subject${num}_sem_marks` as keyof typeof studentForm]}
                        onChange={(e) => setStudentForm({ 
                          ...studentForm, 
                          [`subject${num}_sem_marks`]: parseInt(e.target.value) || 0 
                        })}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="edit_total_cgpa">Total CGPA</Label>
                <Input
                  id="edit_total_cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={studentForm.total_cgpa}
                  onChange={(e) => setStudentForm({ ...studentForm, total_cgpa: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => resetForm()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Student'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManageStudents;