import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, AlertCircle, CheckCircle, X, Download, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentData {
  seat_number: number;
  roll_no: string;
  student_name: string;
  gender?: string;
  subject1_sem_exam: number;
  subject1_ia_exam: number;
  subject1_term_marks: number;
  subject1_viva_marks: number;
  subject2_sem_exam: number;
  subject2_ia_exam: number;
  subject2_term_marks: number;
  subject2_viva_marks: number;
  subject3_sem_exam: number;
  subject3_ia_exam: number;
  subject3_term_marks: number;
  subject3_viva_marks: number;
  subject4_sem_exam: number;
  subject4_ia_exam: number;
  subject4_term_marks: number;
  subject4_viva_marks: number;
  subject5_sem_exam: number;
  subject5_ia_exam: number;
  subject5_term_marks: number;
  subject5_viva_marks: number;
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
    const csvContent = `Seat Number,Roll No,Student Name,Gender,S1_SemExam,S1_IAExam,S1_TermMarks,S1_Viva,S2_SemExam,S2_IAExam,S2_TermMarks,S2_Viva,S3_SemExam,S3_IAExam,S3_TermMarks,S3_Viva,S4_SemExam,S4_IAExam,S4_TermMarks,S4_Viva,S5_SemExam,S5_IAExam,S5_TermMarks,S5_Viva,Total_CGPA
123456,01,John Doe,Male,70,18,85,20,65,17,80,22,72,19,88,21,68,16,82,20,75,18,90,23,8.75
123457,02,Jane Smith,Female,75,19,90,23,70,18,85,21,68,17,82,20,72,19,88,22,78,20,92,24,9.12`;
    
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
    
    if (!student.seat_number || student.seat_number.toString().length !== 6) {
      errors.push(`Row ${index + 2}: Seat number must be exactly 6 digits`);
    }
    
    if (student.roll_no && (student.roll_no > 199 || student.roll_no.toString().length > 2)) {
      errors.push(`Row ${index + 2}: Roll number must be under 200 and max 2 digits`);
    }
    
    if (!student.student_name || student.student_name.trim().length === 0) {
      errors.push(`Row ${index + 2}: Student name is required`);
    }
    
    // Validate marks for each subject
    [1, 2, 3, 4, 5].forEach(num => {
      const semExam = student[`subject${num}_sem_exam`];
      const iaExam = student[`subject${num}_ia_exam`];
      const termMarks = student[`subject${num}_term_marks`];
      const vivaMarks = student[`subject${num}_viva_marks`];
      
      if (semExam < 0 || semExam > 80) {
        errors.push(`Row ${index + 2}: Subject ${num} Sem Exam must be between 0-80`);
      }
      if (iaExam < 0 || iaExam > 20) {
        errors.push(`Row ${index + 2}: Subject ${num} IA Exam must be between 0-20`);
      }
      if (termMarks < 0 || termMarks > 100) {
        errors.push(`Row ${index + 2}: Subject ${num} Term Marks must be between 0-100`);
      }
      if (vivaMarks < 0 || vivaMarks > 25) {
        errors.push(`Row ${index + 2}: Subject ${num} Viva Marks must be between 0-25`);
      }
    });
    
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
        'S1_SemExam', 'S1_IAExam', 'S1_TermMarks', 'S1_Viva',
        'S2_SemExam', 'S2_IAExam', 'S2_TermMarks', 'S2_Viva',
        'S3_SemExam', 'S3_IAExam', 'S3_TermMarks', 'S3_Viva',
        'S4_SemExam', 'S4_IAExam', 'S4_TermMarks', 'S4_Viva',
        'S5_SemExam', 'S5_IAExam', 'S5_TermMarks', 'S5_Viva',
        'Total_CGPA'
      ];
      
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
            subject1_sem_exam: parseInt(values[4]) || 0,
            subject1_ia_exam: parseInt(values[5]) || 0,
            subject1_term_marks: parseInt(values[6]) || 0,
            subject1_viva_marks: parseInt(values[7]) || 0,
            subject2_sem_exam: parseInt(values[8]) || 0,
            subject2_ia_exam: parseInt(values[9]) || 0,
            subject2_term_marks: parseInt(values[10]) || 0,
            subject2_viva_marks: parseInt(values[11]) || 0,
            subject3_sem_exam: parseInt(values[12]) || 0,
            subject3_ia_exam: parseInt(values[13]) || 0,
            subject3_term_marks: parseInt(values[14]) || 0,
            subject3_viva_marks: parseInt(values[15]) || 0,
            subject4_sem_exam: parseInt(values[16]) || 0,
            subject4_ia_exam: parseInt(values[17]) || 0,
            subject4_term_marks: parseInt(values[18]) || 0,
            subject4_viva_marks: parseInt(values[19]) || 0,
            subject5_sem_exam: parseInt(values[20]) || 0,
            subject5_ia_exam: parseInt(values[21]) || 0,
            subject5_term_marks: parseInt(values[22]) || 0,
            subject5_viva_marks: parseInt(values[23]) || 0,
            total_cgpa: parseFloat(values[24]) || 0,
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

  const calculateTotal = (student: StudentData) => {
    let total = 0;
    for (let i = 1; i <= 5; i++) {
      total += student[`subject${i}_sem_exam` as keyof StudentData] as number;
      total += student[`subject${i}_ia_exam` as keyof StudentData] as number;
      total += student[`subject${i}_term_marks` as keyof StudentData] as number;
      total += student[`subject${i}_viva_marks` as keyof StudentData] as number;
    }
    return total;
  };

  const handleFinalUpload = async () => {
    if (parsedData.length === 0) return;
    
    setLoading(true);
    
    try {
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
            Upload CSV file to add multiple students at once. Each subject has 4 mark sections: Sem Exam (80), IA Exam (20), Term Marks (100), Viva (25).
          </DialogDescription>
        </DialogHeader>
        
        {!showPreview ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload CSV File</Label>
              <Input
                type="file"
                accept=".csv"
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
                          <TableCell>{calculateTotal(student)}/1125</TableCell>
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