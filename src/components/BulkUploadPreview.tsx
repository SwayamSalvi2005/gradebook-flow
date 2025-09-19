import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, X, Download, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentData {
  seat_number: number;
  roll_no: string;
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

interface BulkUploadPreviewProps {
  databaseId: string;
  onUploadComplete: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BulkUploadPreview = ({ databaseId, onUploadComplete, open, onOpenChange }: BulkUploadPreviewProps) => {
  const [parsedData, setParsedData] = useState<StudentData[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    const csvContent = `Seat Number,Roll No,Student Name,Gender,Subject1_UnitTest,Subject1_SemMarks,Subject2_UnitTest,Subject2_SemMarks,Subject3_UnitTest,Subject3_SemMarks,Subject4_UnitTest,Subject4_SemMarks,Subject5_UnitTest,Subject5_SemMarks,Total_CGPA
123456,01,John Doe,Male,18,75,19,80,17,72,20,85,18,78,8.75
123457,02,Jane Smith,Female,20,88,18,82,19,85,17,79,19,87,9.12`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_upload_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const validateStudent = (student: any, index: number): string[] => {
    const errors: string[] = [];
    
    // Validate seat number (6 digits)
    if (!student.seat_number || student.seat_number.toString().length !== 6) {
      errors.push(`Row ${index + 2}: Seat number must be exactly 6 digits`);
    }
    
    // Validate roll number (max 2 digits, under 200)
    if (student.roll_no && (student.roll_no > 199 || student.roll_no.toString().length > 2)) {
      errors.push(`Row ${index + 2}: Roll number must be under 200 and max 2 digits`);
    }
    
    // Validate name
    if (!student.student_name || student.student_name.trim().length === 0) {
      errors.push(`Row ${index + 2}: Student name is required`);
    }
    
    // Validate marks
    [1, 2, 3, 4, 5].forEach(num => {
      const unitTest = student[`subject${num}_unit_test`];
      const semMarks = student[`subject${num}_sem_marks`];
      
      if (unitTest < 0 || unitTest > 20) {
        errors.push(`Row ${index + 2}: Subject ${num} unit test marks must be between 0-20`);
      }
      if (semMarks < 0 || semMarks > 90) {
        errors.push(`Row ${index + 2}: Subject ${num} semester marks must be between 0-90`);
      }
    });
    
    // Validate CGPA
    if (student.total_cgpa < 0 || student.total_cgpa > 10) {
      errors.push(`Row ${index + 2}: CGPA must be between 0-10`);
    }
    
    return errors;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvData = e.target?.result as string;
      const lines = csvData.trim().split('\n');
      
      if (lines.length < 2) {
        setErrors(['File must contain at least one data row']);
        return;
      }
      
      const headers = lines[0].split(',').map(h => h.trim());
      const expectedHeaders = [
        'Seat Number', 'Roll No', 'Student Name', 'Gender',
        'Subject1_UnitTest', 'Subject1_SemMarks',
        'Subject2_UnitTest', 'Subject2_SemMarks',
        'Subject3_UnitTest', 'Subject3_SemMarks',
        'Subject4_UnitTest', 'Subject4_SemMarks',
        'Subject5_UnitTest', 'Subject5_SemMarks',
        'Total_CGPA'
      ];
      
      // Check headers
      const headerErrors: string[] = [];
      expectedHeaders.forEach(expected => {
        if (!headers.includes(expected)) {
          headerErrors.push(`Missing header: ${expected}`);
        }
      });
      
      if (headerErrors.length > 0) {
        setErrors([...headerErrors, 'Please download and use the correct template']);
        return;
      }
      
      // Parse data rows
      const students: StudentData[] = [];
      const allErrors: string[] = [];
      
      lines.slice(1).forEach((line, index) => {
        if (line.trim()) {
          const values = line.split(',').map(v => v.trim());
          
          const student = {
            seat_number: parseInt(values[0]) || 0,
            roll_no: values[1] || '',
            student_name: values[2] || '',
            gender: values[3] || undefined,
            subject1_unit_test: parseInt(values[4]) || 0,
            subject1_sem_marks: parseInt(values[5]) || 0,
            subject2_unit_test: parseInt(values[6]) || 0,
            subject2_sem_marks: parseInt(values[7]) || 0,
            subject3_unit_test: parseInt(values[8]) || 0,
            subject3_sem_marks: parseInt(values[9]) || 0,
            subject4_unit_test: parseInt(values[10]) || 0,
            subject4_sem_marks: parseInt(values[11]) || 0,
            subject5_unit_test: parseInt(values[12]) || 0,
            subject5_sem_marks: parseInt(values[13]) || 0,
            total_cgpa: parseFloat(values[14]) || 0,
          };
          
          const studentErrors = validateStudent(student, index);
          allErrors.push(...studentErrors);
          
          if (studentErrors.length === 0) {
            students.push(student);
          }
        }
      });
      
      setParsedData(students);
      setErrors(allErrors);
      setShowPreview(true);
    };

    reader.readAsText(file);
  };

  const handleFinalUpload = async () => {
    if (parsedData.length === 0) return;
    
    setLoading(true);
    
    try {
      // Check for duplicate seat numbers in database
      const { data: existingStudents } = await supabase
        .from('students')
        .select('seat_number')
        .in('seat_number', parsedData.map(s => s.seat_number));
      
      const existingSeatNumbers = new Set(existingStudents?.map(s => s.seat_number) || []);
      const duplicateCount = parsedData.filter(s => existingSeatNumbers.has(s.seat_number)).length;
      
      if (duplicateCount > 0) {
        toast({
          title: "Duplicate Seat Numbers Found",
          description: `${duplicateCount} students with existing seat numbers will be skipped`,
          variant: "destructive",
        });
        
        // Filter out duplicates
        const uniqueStudents = parsedData.filter(s => !existingSeatNumbers.has(s.seat_number));
        
        if (uniqueStudents.length === 0) {
          toast({
            title: "No New Students",
            description: "All students in the file already exist",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Insert only unique students
        const { error } = await supabase
          .from('students')
          .insert(uniqueStudents.map(student => ({
            ...student,
            academic_database_id: databaseId,
            gender: student.gender && ['Male', 'Female', 'Other'].includes(student.gender) 
              ? student.gender as 'Male' | 'Female' | 'Other'
              : null
          })));
        
        if (error) throw error;
        
        toast({
          title: "Upload Successful",
          description: `${uniqueStudents.length} new students uploaded (${duplicateCount} duplicates skipped)`,
        });
      } else {
        // Insert all students
        const { error } = await supabase
          .from('students')
          .insert(parsedData.map(student => ({
            ...student,
            academic_database_id: databaseId,
            gender: student.gender && ['Male', 'Female', 'Other'].includes(student.gender) 
              ? student.gender as 'Male' | 'Female' | 'Other'
              : null
          })));
        
        if (error) throw error;
        
        toast({
          title: "Upload Successful",
          description: `${parsedData.length} students uploaded successfully!`,
        });
      }
      
      onUploadComplete();
      onOpenChange(false);
      setParsedData([]);
      setErrors([]);
      setShowPreview(false);
      
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  const resetUpload = () => {
    setParsedData([]);
    setErrors([]);
    setShowPreview(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Bulk Upload Students
          </DialogTitle>
          <DialogDescription>
            Upload Excel/CSV file to add multiple students at once
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload CSV File</Label>
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
              />
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please ensure your file follows the template format. Download the template first if needed.
              </AlertDescription>
            </Alert>
            
            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-600">{parsedData.length}</div>
                      <div className="text-sm text-muted-foreground">Valid Records</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2">
                    <X className="h-5 w-5 text-red-500" />
                    <div>
                      <div className="text-2xl font-bold text-red-600">{errors.length}</div>
                      <div className="text-sm text-muted-foreground">Errors Found</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{parsedData.length}</div>
                      <div className="text-sm text-muted-foreground">Ready to Upload</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Errors Display */}
            {errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Please fix the following errors:</div>
                  <ScrollArea className="h-20">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Data Preview */}
            {parsedData.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Preview Data ({parsedData.length} records)</h4>
                <ScrollArea className="h-60 border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seat No</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>CGPA</TableHead>
                        <TableHead>Total Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>{student.seat_number}</TableCell>
                          <TableCell>{student.roll_no}</TableCell>
                          <TableCell>{student.student_name}</TableCell>
                          <TableCell>{student.gender || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.total_cgpa}</Badge>
                          </TableCell>
                          <TableCell>
                            {student.subject1_unit_test + student.subject1_sem_marks +
                             student.subject2_unit_test + student.subject2_sem_marks +
                             student.subject3_unit_test + student.subject3_sem_marks +
                             student.subject4_unit_test + student.subject4_sem_marks +
                             student.subject5_unit_test + student.subject5_sem_marks}/550
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {parsedData.length > 10 && (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      ... and {parsedData.length - 10} more records
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetUpload}>
                Upload Different File
              </Button>
              
              <div className="space-x-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleFinalUpload} 
                  disabled={parsedData.length === 0 || loading}
                >
                  {loading ? 'Uploading...' : `Upload ${parsedData.length} Students`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};