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
  math_iv_se: number;
  math_iv_ia: number;
  math_iv_total: number;
  math_iv_tw: number;
  algo_se: number;
  algo_ia: number;
  algo_total: number;
  dbms_se: number;
  dbms_ia: number;
  dbms_total: number;
  os_se: number;
  os_ia: number;
  os_total: number;
  micro_se: number;
  micro_ia: number;
  micro_total: number;
  result: string;
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
    const csvContent = `Sr,Seat No,Student Name,M/F,Math IV (SE),Math IV (IA),Math IV (Total),Math IV (TW),Algo (SE),Algo (IA),Algo (Total),DBMS (SE),DBMS (IA),DBMS (Total),OS (SE),OS (IA),OS (Total),Micro (SE),Micro (IA),Micro (Total),Result P/F,Pointer
1,154201,ACHAREKAR ROHAN PRASAD,M,52,13,65,20,45,16,61,40,13,53,32,11,43,50,11,61,P,7.46
2,154202,ADEKAR NITESH GORAKHNATH,M,71,18,89,23,64,18,82,69,20,89,53,17,70,68,16,84,P,9.45`;
    
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
    
    if (!student.student_name || student.student_name.trim().length === 0) {
      errors.push(`Row ${index + 2}: Student name is required`);
    }
    
    // Validate Math IV marks (has TW)
    if (student.math_iv_se < 0 || student.math_iv_se > 80) {
      errors.push(`Row ${index + 2}: Math IV SE must be between 0-80`);
    }
    if (student.math_iv_ia < 0 || student.math_iv_ia > 20) {
      errors.push(`Row ${index + 2}: Math IV IA must be between 0-20`);
    }
    if (student.math_iv_tw < 0 || student.math_iv_tw > 25) {
      errors.push(`Row ${index + 2}: Math IV TW must be between 0-25`);
    }
    
    // Validate other subjects
    const subjects = ['algo', 'dbms', 'os', 'micro'];
    subjects.forEach(subj => {
      const se = student[`${subj}_se`];
      const ia = student[`${subj}_ia`];
      
      if (se < 0 || se > 80) {
        errors.push(`Row ${index + 2}: ${subj.toUpperCase()} SE must be between 0-80`);
      }
      if (ia < 0 || ia > 20) {
        errors.push(`Row ${index + 2}: ${subj.toUpperCase()} IA must be between 0-20`);
      }
    });
    
    if (student.total_cgpa < 0 || student.total_cgpa > 10) {
      errors.push(`Row ${index + 2}: Pointer must be between 0-10`);
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
        'Sr', 'Seat No', 'Student Name', 'M/F',
        'Math IV (SE)', 'Math IV (IA)', 'Math IV (Total)', 'Math IV (TW)',
        'Algo (SE)', 'Algo (IA)', 'Algo (Total)',
        'DBMS (SE)', 'DBMS (IA)', 'DBMS (Total)',
        'OS (SE)', 'OS (IA)', 'OS (Total)',
        'Micro (SE)', 'Micro (IA)', 'Micro (Total)',
        'Result P/F', 'Pointer'
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
            seat_number: parseInt(values[1]) || 0,
            roll_no: values[0] || '',
            student_name: values[2] || '',
            gender: values[3] === 'M' ? 'Male' : values[3] === 'F' ? 'Female' : undefined,
            math_iv_se: parseInt(values[4]) || 0,
            math_iv_ia: parseInt(values[5]) || 0,
            math_iv_total: parseInt(values[6]) || 0,
            math_iv_tw: parseInt(values[7]) || 0,
            algo_se: parseInt(values[8]) || 0,
            algo_ia: parseInt(values[9]) || 0,
            algo_total: parseInt(values[10]) || 0,
            dbms_se: parseInt(values[11]) || 0,
            dbms_ia: parseInt(values[12]) || 0,
            dbms_total: parseInt(values[13]) || 0,
            os_se: parseInt(values[14]) || 0,
            os_ia: parseInt(values[15]) || 0,
            os_total: parseInt(values[16]) || 0,
            micro_se: parseInt(values[17]) || 0,
            micro_ia: parseInt(values[18]) || 0,
            micro_total: parseInt(values[19]) || 0,
            result: values[20] || 'P',
            total_cgpa: parseFloat(values[21]) || 0,
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
            Upload CSV file matching the Excel format: Math IV (SE, IA, Total, TW), Algo, DBMS, OS, Micro (SE, IA, Total each).
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
                        <TableHead>Name</TableHead>
                        <TableHead>M/F</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Pointer</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>{student.seat_number}</TableCell>
                          <TableCell>{student.student_name}</TableCell>
                          <TableCell>{student.gender === 'Male' ? 'M' : student.gender === 'Female' ? 'F' : 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={student.result === 'P' ? 'default' : 'destructive'}>
                              {student.result}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.total_cgpa}</Badge>
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
