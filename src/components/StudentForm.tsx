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

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
  databaseId: string;
  onSave: () => void;
}

const subjects = [
  { key: 'math_iv', name: 'Math IV', hasTW: true },
  { key: 'algo', name: 'Algo', hasTW: false },
  { key: 'dbms', name: 'DBMS', hasTW: false },
  { key: 'os', name: 'OS', hasTW: false },
  { key: 'micro', name: 'Micro', hasTW: false },
];

const getDefaultFormData = () => ({
  seat_number: '',
  roll_no: '',
  student_name: '',
  gender: '' as '' | 'Male' | 'Female' | 'Other',
  math_iv_se: 0,
  math_iv_ia: 0,
  math_iv_total: 0,
  math_iv_tw: 0,
  algo_se: 0,
  algo_ia: 0,
  algo_total: 0,
  dbms_se: 0,
  dbms_ia: 0,
  dbms_total: 0,
  os_se: 0,
  os_ia: 0,
  os_total: 0,
  micro_se: 0,
  micro_ia: 0,
  micro_total: 0,
  result: 'P' as 'P' | 'F',
  total_cgpa: 0.00
});

export const StudentForm = ({ open, onOpenChange, student, databaseId, onSave }: StudentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(getDefaultFormData());

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
        math_iv_se: student.math_iv_se || 0,
        math_iv_ia: student.math_iv_ia || 0,
        math_iv_total: student.math_iv_total || 0,
        math_iv_tw: student.math_iv_tw || 0,
        algo_se: student.algo_se || 0,
        algo_ia: student.algo_ia || 0,
        algo_total: student.algo_total || 0,
        dbms_se: student.dbms_se || 0,
        dbms_ia: student.dbms_ia || 0,
        dbms_total: student.dbms_total || 0,
        os_se: student.os_se || 0,
        os_ia: student.os_ia || 0,
        os_total: student.os_total || 0,
        micro_se: student.micro_se || 0,
        micro_ia: student.micro_ia || 0,
        micro_total: student.micro_total || 0,
        result: (student.result as 'P' | 'F') || 'P',
        total_cgpa: student.total_cgpa || 0
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

    // Validate marks
    for (const subject of subjects) {
      const se = formData[`${subject.key}_se` as keyof typeof formData] as number;
      const ia = formData[`${subject.key}_ia` as keyof typeof formData] as number;
      const total = formData[`${subject.key}_total` as keyof typeof formData] as number;
      
      if (se < 0 || se > 80) {
        toast({
          title: "Validation Error",
          description: `${subject.name} SE must be between 0-80`,
          variant: "destructive",
        });
        return false;
      }
      
      if (ia < 0 || ia > 20) {
        toast({
          title: "Validation Error",
          description: `${subject.name} IA must be between 0-20`,
          variant: "destructive",
        });
        return false;
      }

      if (total < 0 || total > 100) {
        toast({
          title: "Validation Error",
          description: `${subject.name} Total must be between 0-100`,
          variant: "destructive",
        });
        return false;
      }
      
      if (subject.hasTW) {
        const tw = formData[`${subject.key}_tw` as keyof typeof formData] as number;
        if (tw < 0 || tw > 25) {
          toast({
            title: "Validation Error",
            description: `${subject.name} TW must be between 0-25`,
            variant: "destructive",
          });
          return false;
        }
      }
    }

    if (formData.total_cgpa < 0 || formData.total_cgpa > 10) {
      toast({
        title: "Validation Error",
        description: "Pointer/CGPA must be between 0-10",
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
        math_iv_se: formData.math_iv_se,
        math_iv_ia: formData.math_iv_ia,
        math_iv_total: formData.math_iv_total,
        math_iv_tw: formData.math_iv_tw,
        algo_se: formData.algo_se,
        algo_ia: formData.algo_ia,
        algo_total: formData.algo_total,
        dbms_se: formData.dbms_se,
        dbms_ia: formData.dbms_ia,
        dbms_total: formData.dbms_total,
        os_se: formData.os_se,
        os_ia: formData.os_ia,
        os_total: formData.os_total,
        micro_se: formData.micro_se,
        micro_ia: formData.micro_ia,
        micro_total: formData.micro_total,
        result: formData.result,
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

  const updateSubjectMarks = (subjectKey: string, field: string, value: number) => {
    setFormData(prev => {
      const newData = { ...prev, [`${subjectKey}_${field}`]: value };
      
      // Auto-calculate total (SE + IA)
      const se = (field === 'se' ? value : prev[`${subjectKey}_se` as keyof typeof prev]) as number;
      const ia = (field === 'ia' ? value : prev[`${subjectKey}_ia` as keyof typeof prev]) as number;
      
      return {
        ...newData,
        [`${subjectKey}_total`]: se + ia
      };
    });
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  placeholder="154201"
                  required
                />
                {!student && (
                  <Button type="button" variant="outline" onClick={generateSeatNumber}>
                    Gen
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roll_no">Roll No</Label>
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
              <Label htmlFor="gender">M/F</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value as 'Male' | 'Female' | 'Other' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">M</SelectItem>
                  <SelectItem value="Female">F</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">Result</Label>
              <Select
                value={formData.result}
                onValueChange={(value) => setFormData({ ...formData, result: value as 'P' | 'F' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P">Pass</SelectItem>
                  <SelectItem value="F">Fail</SelectItem>
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
              placeholder="ACHAREKAR ROHAN PRASAD"
              required
            />
          </div>

          {/* Subject Marks */}
          <div className="space-y-4">
            <h4 className="font-semibold">Subject Marks</h4>
            {subjects.map((subject) => (
              <div key={subject.key} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <Label className="font-medium">{subject.name}</Label>
                  <span className="text-sm text-muted-foreground">
                    Total: {formData[`${subject.key}_total` as keyof typeof formData]}/100
                    {subject.hasTW && ` | TW: ${formData.math_iv_tw}/25`}
                  </span>
                </div>
                <div className={`grid ${subject.hasTW ? 'grid-cols-4' : 'grid-cols-3'} gap-4`}>
                  <div className="space-y-2">
                    <Label>SE (0-80)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="80"
                      value={formData[`${subject.key}_se` as keyof typeof formData]}
                      onChange={(e) => updateSubjectMarks(subject.key, 'se', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IA (0-20)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={formData[`${subject.key}_ia` as keyof typeof formData]}
                      onChange={(e) => updateSubjectMarks(subject.key, 'ia', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total (auto)</Label>
                    <Input
                      type="number"
                      value={formData[`${subject.key}_total` as keyof typeof formData]}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  {subject.hasTW && (
                    <div className="space-y-2">
                      <Label>TW (0-25)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="25"
                        value={formData.math_iv_tw}
                        onChange={(e) => setFormData({ ...formData, math_iv_tw: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pointer */}
          <div className="space-y-2">
            <Label htmlFor="total_cgpa">Pointer/CGPA (0-10) *</Label>
            <Input
              id="total_cgpa"
              type="number"
              min="0"
              max="10"
              step="0.01"
              value={formData.total_cgpa}
              onChange={(e) => setFormData({ ...formData, total_cgpa: parseFloat(e.target.value) || 0 })}
              placeholder="7.46"
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
