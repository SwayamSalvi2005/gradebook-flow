import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  seat_number: number;
  roll_no?: string;
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

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  databaseId: string;
  onSave: () => void;
}

const getDefaultFormData = () => ({
  seat_number: '',
  roll_no: '',
  student_name: '',
  gender: '' as '' | 'Male' | 'Female' | 'Other',
  subject1_sem_exam: 0,
  subject1_ia_exam: 0,
  subject1_term_marks: 0,
  subject1_viva_marks: 0,
  subject2_sem_exam: 0,
  subject2_ia_exam: 0,
  subject2_term_marks: 0,
  subject2_viva_marks: 0,
  subject3_sem_exam: 0,
  subject3_ia_exam: 0,
  subject3_term_marks: 0,
  subject3_viva_marks: 0,
  subject4_sem_exam: 0,
  subject4_ia_exam: 0,
  subject4_term_marks: 0,
  subject4_viva_marks: 0,
  subject5_sem_exam: 0,
  subject5_ia_exam: 0,
  subject5_term_marks: 0,
  subject5_viva_marks: 0,
  total_cgpa: 0.00
});

export const StudentForm = ({ open, onOpenChange, student, databaseId, onSave }: StudentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData());

  // Generate unique seat number
  const generateSeatNumber = async () => {
    let seatNumber;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      seatNumber = Math.floor(100000 + Math.random() * 900000);
      
      const { data } = await supabase
        .from('students')
        .select('seat_number')
        .eq('seat_number', seatNumber)
        .maybeSingle();
      
      if (!data) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (seatNumber && isUnique) {
      setFormData(prev => ({ ...prev, seat_number: seatNumber.toString() }));
    } else {
      toast({
        title: "Error",
        description: "Could not generate unique seat number. Please enter manually.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (student) {
      setFormData({
        seat_number: student.seat_number.toString(),
        roll_no: student.roll_no || '',
        student_name: student.student_name,
        gender: (student.gender as 'Male' | 'Female' | 'Other') || '',
        subject1_sem_exam: student.subject1_sem_exam,
        subject1_ia_exam: student.subject1_ia_exam,
        subject1_term_marks: student.subject1_term_marks,
        subject1_viva_marks: student.subject1_viva_marks,
        subject2_sem_exam: student.subject2_sem_exam,
        subject2_ia_exam: student.subject2_ia_exam,
        subject2_term_marks: student.subject2_term_marks,
        subject2_viva_marks: student.subject2_viva_marks,
        subject3_sem_exam: student.subject3_sem_exam,
        subject3_ia_exam: student.subject3_ia_exam,
        subject3_term_marks: student.subject3_term_marks,
        subject3_viva_marks: student.subject3_viva_marks,
        subject4_sem_exam: student.subject4_sem_exam,
        subject4_ia_exam: student.subject4_ia_exam,
        subject4_term_marks: student.subject4_term_marks,
        subject4_viva_marks: student.subject4_viva_marks,
        subject5_sem_exam: student.subject5_sem_exam,
        subject5_ia_exam: student.subject5_ia_exam,
        subject5_term_marks: student.subject5_term_marks,
        subject5_viva_marks: student.subject5_viva_marks,
        total_cgpa: student.total_cgpa
      });
    } else {
      setFormData(getDefaultFormData());
      if (open && !student) {
        generateSeatNumber();
      }
    }
  }, [student, open]);

  const validateForm = () => {
    if (!formData.seat_number || formData.seat_number.length !== 6) {
      toast({
        title: "Validation Error",
        description: "Seat number must be exactly 6 digits",
        variant: "destructive",
      });
      return false;
    }

    if (formData.roll_no && (parseInt(formData.roll_no) > 199 || formData.roll_no.length > 2)) {
      toast({
        title: "Validation Error",
        description: "Roll number must be under 200 and maximum 2 digits",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.student_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Student name is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate marks for each subject
    for (let i = 1; i <= 5; i++) {
      const semExam = formData[`subject${i}_sem_exam` as keyof typeof formData] as number;
      const iaExam = formData[`subject${i}_ia_exam` as keyof typeof formData] as number;
      const termMarks = formData[`subject${i}_term_marks` as keyof typeof formData] as number;
      const vivaMarks = formData[`subject${i}_viva_marks` as keyof typeof formData] as number;
      
      if (semExam < 0 || semExam > 80) {
        toast({
          title: "Validation Error",
          description: `Subject ${i} Sem Exam marks must be between 0-80`,
          variant: "destructive",
        });
        return false;
      }
      
      if (iaExam < 0 || iaExam > 20) {
        toast({
          title: "Validation Error",
          description: `Subject ${i} IA Exam marks must be between 0-20`,
          variant: "destructive",
        });
        return false;
      }
      
      if (termMarks < 0 || termMarks > 100) {
        toast({
          title: "Validation Error",
          description: `Subject ${i} Term Marks must be between 0-100`,
          variant: "destructive",
        });
        return false;
      }
      
      if (vivaMarks < 0 || vivaMarks > 25) {
        toast({
          title: "Validation Error",
          description: `Subject ${i} Viva Marks must be between 0-25`,
          variant: "destructive",
        });
        return false;
      }
    }

    if (formData.total_cgpa < 0 || formData.total_cgpa > 10) {
      toast({
        title: "Validation Error",
        description: "CGPA must be between 0-10",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const studentData = {
        seat_number: parseInt(formData.seat_number),
        roll_no: formData.roll_no || null,
        student_name: formData.student_name.trim(),
        gender: formData.gender || null,
        subject1_sem_exam: formData.subject1_sem_exam,
        subject1_ia_exam: formData.subject1_ia_exam,
        subject1_term_marks: formData.subject1_term_marks,
        subject1_viva_marks: formData.subject1_viva_marks,
        subject2_sem_exam: formData.subject2_sem_exam,
        subject2_ia_exam: formData.subject2_ia_exam,
        subject2_term_marks: formData.subject2_term_marks,
        subject2_viva_marks: formData.subject2_viva_marks,
        subject3_sem_exam: formData.subject3_sem_exam,
        subject3_ia_exam: formData.subject3_ia_exam,
        subject3_term_marks: formData.subject3_term_marks,
        subject3_viva_marks: formData.subject3_viva_marks,
        subject4_sem_exam: formData.subject4_sem_exam,
        subject4_ia_exam: formData.subject4_ia_exam,
        subject4_term_marks: formData.subject4_term_marks,
        subject4_viva_marks: formData.subject4_viva_marks,
        subject5_sem_exam: formData.subject5_sem_exam,
        subject5_ia_exam: formData.subject5_ia_exam,
        subject5_term_marks: formData.subject5_term_marks,
        subject5_viva_marks: formData.subject5_viva_marks,
        total_cgpa: formData.total_cgpa,
        academic_database_id: databaseId
      };

      if (student) {
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', student.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('students')
          .insert([studentData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Student added successfully!",
        });
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const calculateSubjectTotal = (num: number) => {
    const semExam = formData[`subject${num}_sem_exam` as keyof typeof formData] as number;
    const iaExam = formData[`subject${num}_ia_exam` as keyof typeof formData] as number;
    const termMarks = formData[`subject${num}_term_marks` as keyof typeof formData] as number;
    const vivaMarks = formData[`subject${num}_viva_marks` as keyof typeof formData] as number;
    return semExam + iaExam + termMarks + vivaMarks;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {student ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
          <DialogDescription>
            Enter student details and marks for all subjects
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seat_number">Seat Number (6 digits) *</Label>
              <div className="flex gap-2">
                <Input
                  id="seat_number"
                  type="text"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={formData.seat_number}
                  onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
                  placeholder="123456"
                  required
                />
                {!student && (
                  <Button type="button" variant="outline" onClick={generateSeatNumber}>
                    Generate
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roll_no">Roll Number (max 2 digits, under 200)</Label>
              <Input
                id="roll_no"
                type="number"
                min="1"
                max="199"
                value={formData.roll_no}
                onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                placeholder="01"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'Male' | 'Female' | 'Other' })}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="student_name">Student Name *</Label>
            <Input
              id="student_name"
              value={formData.student_name}
              onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Subject Marks */}
          <div className="space-y-4">
            <h4 className="font-semibold">Subject Marks</h4>
            {[1, 2, 3, 4, 5].map((num) => (
              <div key={num} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <Label className="font-medium">Subject {num}</Label>
                  <span className="text-sm text-muted-foreground">
                    Total: {calculateSubjectTotal(num)}/225
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`subject${num}_sem_exam`}>Sem Exam (0-80)</Label>
                    <Input
                      id={`subject${num}_sem_exam`}
                      type="number"
                      min="0"
                      max="80"
                      value={formData[`subject${num}_sem_exam` as keyof typeof formData]}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [`subject${num}_sem_exam`]: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`subject${num}_ia_exam`}>IA Exam (0-20)</Label>
                    <Input
                      id={`subject${num}_ia_exam`}
                      type="number"
                      min="0"
                      max="20"
                      value={formData[`subject${num}_ia_exam` as keyof typeof formData]}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [`subject${num}_ia_exam`]: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`subject${num}_term_marks`}>Term Marks (0-100)</Label>
                    <Input
                      id={`subject${num}_term_marks`}
                      type="number"
                      min="0"
                      max="100"
                      value={formData[`subject${num}_term_marks` as keyof typeof formData]}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [`subject${num}_term_marks`]: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`subject${num}_viva_marks`}>Viva Marks (0-25)</Label>
                    <Input
                      id={`subject${num}_viva_marks`}
                      type="number"
                      min="0"
                      max="25"
                      value={formData[`subject${num}_viva_marks` as keyof typeof formData]}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [`subject${num}_viva_marks`]: parseInt(e.target.value) || 0 
                      })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CGPA */}
          <div className="space-y-2">
            <Label htmlFor="total_cgpa">CGPA (0-10) *</Label>
            <Input
              id="total_cgpa"
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={formData.total_cgpa}
              onChange={(e) => setFormData({ ...formData, total_cgpa: parseFloat(e.target.value) || 0 })}
              placeholder="8.75"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};