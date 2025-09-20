import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Download, ArrowLeft, User, GraduationCap, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentPortal = () => {
  const [seatNumber, setSeatNumber] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [database, setDatabase] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seatNumber) {
      toast({
        title: "Validation Error",
        description: "Please enter your seat number.",
        variant: "destructive",
      });
      return;
    }

    // Validate seat number is 6 digits
    const seatNum = parseInt(seatNumber);
    if (seatNum < 100000 || seatNum > 999999) {
      toast({
        title: "Validation Error",
        description: "Seat number must be exactly 6 digits.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the student record by seat number
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select(`
          *,
          academic_databases (
            id,
            database_name,
            branch,
            graduation_year,
            year_classification,
            semester,
            batch
          )
        `)
        .eq('seat_number', seatNum)
        .maybeSingle();

      if (studentError) {
        toast({
          title: "Error",
          description: "Failed to fetch student data.",
          variant: "destructive",
        });
      } else if (!studentData) {
        toast({
          title: "Record Not Found",
          description: "No student found with this seat number.",
          variant: "destructive",
        });
        setStudent(null);
        setDatabase(null);
      } else {
        setStudent(studentData);
        setDatabase(studentData.academic_databases);
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
            <p className="text-muted-foreground">Enter your 6-digit seat number to get your results instantly</p>
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
                <div className="space-y-2">
                  <Label htmlFor="seatNumber">Seat Number</Label>
                  <Input
                    id="seatNumber"
                    type="number"
                    placeholder="6-digit seat number"
                    min="100000"
                    max="999999"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value)}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your 6-digit seat number to get your results
                  </p>
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
                    <strong>Roll Number:</strong> {student.roll_no || 'N/A'}
                  </div>
                  <div>
                    <strong>Branch:</strong> {database?.branch}
                  </div>
                  <div>
                    <strong>Database:</strong> {database?.database_name}
                  </div>
                  <div>
                    <strong>Graduation Year:</strong> {database?.graduation_year}
                  </div>
                  <div>
                    <strong>Year:</strong> {database?.year_classification}
                  </div>
                  <div>
                    <strong>Semester:</strong> {database?.semester}
                  </div>
                  <div>
                    <strong>Batch:</strong> {database?.batch}
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