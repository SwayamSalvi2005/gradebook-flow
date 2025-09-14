import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Download, ArrowLeft, User, BookOpen, Trophy, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

type BranchType = 'Computer Eng.' | 'Electronics and Telecom' | 'Information Technology' | 'Electronics and Computer Science' | 'Electrical';

const branches: BranchType[] = [
  'Computer Eng.',
  'Electronics and Telecom',
  'Information Technology',
  'Electronics and Computer Science',
  'Electrical'
];

const StudentPortal = () => {
  const [formData, setFormData] = useState({
    branch: '' as BranchType | '',
    academicYear: '',
    seatNumber: ''
  });
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.branch) {
      toast({
        title: "Validation Error",
        description: "Please select a branch.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      // First get the academic database
      const { data: academicDb, error: dbError } = await supabase
        .from('academic_databases')
        .select('id')
        .eq('branch', formData.branch as BranchType)
        .eq('academic_year', formData.academicYear)
        .single();

      if (dbError || !academicDb) {
        toast({
          title: "Record Not Found",
          description: "No records found for the selected criteria.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Then get the student record
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('academic_database_id', academicDb.id)
        .eq('seat_number', parseInt(formData.seatNumber))
        .single();

      if (studentError || !studentData) {
        toast({
          title: "Record Not Found",
          description: "No student found with the provided seat number.",
          variant: "destructive",
        });
      } else {
        setStudent(studentData);
        toast({
          title: "Record Found",
          description: "Student record retrieved successfully!",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while searching for the record.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (student: any) => {
    return (
      student.subject1_unit_test + student.subject1_sem_marks +
      student.subject2_unit_test + student.subject2_sem_marks +
      student.subject3_unit_test + student.subject3_sem_marks +
      student.subject4_unit_test + student.subject4_sem_marks +
      student.subject5_unit_test + student.subject5_sem_marks
    );
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Student Portal</h1>
            <p className="text-muted-foreground">Search for your results using your seat number</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-primary" />
                Search Student Record
              </CardTitle>
              <CardDescription>
                Enter your details to retrieve your marksheet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      value={formData.branch}
                      onValueChange={(value) => setFormData({ ...formData, branch: value as BranchType })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      placeholder="e.g., 2024-2025"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seatNumber">Seat Number</Label>
                    <Input
                      id="seatNumber"
                      type="number"
                      placeholder="5-digit seat number"
                      min="10000"
                      max="99999"
                      value={formData.seatNumber}
                      onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Searching...' : 'Get My Results'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {student && (
            <Card className="marksheet">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-2xl">
                      <GraduationCap className="mr-2 h-6 w-6 text-primary" />
                      Student Marksheet
                    </CardTitle>
                    <CardDescription>Academic Performance Report</CardDescription>
                  </div>
                  <Button onClick={downloadPDF} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Student Name:</strong> {student.student_name}
                  </div>
                  <div>
                    <strong>Seat Number:</strong> {student.seat_number}
                  </div>
                  <div>
                    <strong>Branch:</strong> {formData.branch}
                  </div>
                  <div>
                    <strong>Academic Year:</strong> {formData.academicYear}
                  </div>
                  {student.gender && (
                    <div>
                      <strong>Gender:</strong> {student.gender}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-border">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-3 text-left">Subject</th>
                        <th className="border border-border p-3 text-center">Unit Test (20)</th>
                        <th className="border border-border p-3 text-center">Semester (90)</th>
                        <th className="border border-border p-3 text-center">Total (110)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <tr key={num}>
                          <td className="border border-border p-3">Subject {num}</td>
                          <td className="border border-border p-3 text-center">
                            {student[`subject${num}_unit_test`] || 0}
                          </td>
                          <td className="border border-border p-3 text-center">
                            {student[`subject${num}_sem_marks`] || 0}
                          </td>
                          <td className="border border-border p-3 text-center font-medium">
                            {(student[`subject${num}_unit_test`] || 0) + (student[`subject${num}_sem_marks`] || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted font-bold">
                        <td className="border border-border p-3">Total</td>
                        <td className="border border-border p-3 text-center">
                          {[1, 2, 3, 4, 5].reduce((sum, num) => sum + (student[`subject${num}_unit_test`] || 0), 0)}
                        </td>
                        <td className="border border-border p-3 text-center">
                          {[1, 2, 3, 4, 5].reduce((sum, num) => sum + (student[`subject${num}_sem_marks`] || 0), 0)}
                        </td>
                        <td className="border border-border p-3 text-center">
                          {calculateTotal(student)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="flex items-center justify-center space-x-6 py-4 bg-muted rounded-lg">
                  <div className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-primary" />
                    <span className="text-lg font-bold">
                      Total CGPA: {student.total_cgpa}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;