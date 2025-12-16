import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Search, Filter, User, Users } from 'lucide-react';

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

interface StudentListProps {
  students: Student[];
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

const subjects = [
  { key: 'math_iv', name: 'Math IV', hasTW: true },
  { key: 'algo', name: 'Algo', hasTW: false },
  { key: 'dbms', name: 'DBMS', hasTW: false },
  { key: 'os', name: 'OS', hasTW: false },
  { key: 'micro', name: 'Micro', hasTW: false },
];

export const StudentList = ({ students, onEditStudent, onDeleteStudent }: StudentListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [sortBy, setSortBy] = useState('roll_no');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students.filter(student => {
      const matchesSearch = 
        student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.seat_number.toString().includes(searchTerm) ||
        (student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesGender = genderFilter === 'all' || 
        (genderFilter === 'male' && student.gender === 'Male') ||
        (genderFilter === 'female' && student.gender === 'Female') ||
        (genderFilter === 'other' && student.gender === 'Other');

      const matchesResult = resultFilter === 'all' ||
        (resultFilter === 'pass' && student.result === 'P') ||
        (resultFilter === 'fail' && student.result === 'F');
      
      return matchesSearch && matchesGender && matchesResult;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'roll_no':
          const rollA = parseInt(a.roll_no || '999');
          const rollB = parseInt(b.roll_no || '999');
          return rollA - rollB;
        case 'name':
          return a.student_name.localeCompare(b.student_name);
        case 'cgpa':
          return b.total_cgpa - a.total_cgpa;
        case 'seat_number':
          return a.seat_number - b.seat_number;
        default:
          return 0;
      }
    });

    return filtered;
  }, [students, searchTerm, genderFilter, resultFilter, sortBy]);

  return (
    <>
      <div className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, seat number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All M/F</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roll_no">Sort by Sr</SelectItem>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="cgpa">Sort by Pointer</SelectItem>
                <SelectItem value="seat_number">Sort by Seat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedStudents.length} of {students.length} students
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {genderFilter === 'all' ? 'All Students' : 
             genderFilter === 'male' ? 'Male' : 'Female'}
          </div>
        </div>

        {/* Student List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedStudents.map((student) => (
            <Card 
              key={student.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium truncate text-sm">{student.student_name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditStudent(student);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteStudent(student.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Seat No:</span>
                    <Badge variant="secondary">{student.seat_number}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">M/F:</span>
                    <span>{student.gender === 'Male' ? 'M' : student.gender === 'Female' ? 'F' : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Result:</span>
                    <Badge variant={student.result === 'P' ? 'default' : 'destructive'}>
                      {student.result === 'P' ? 'Pass' : 'Fail'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pointer:</span>
                    <Badge className="bg-primary text-primary-foreground">
                      {student.total_cgpa?.toFixed(2) || '0.00'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedStudents.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No students found</h3>
              <p className="text-muted-foreground">
                {searchTerm || genderFilter !== 'all' || resultFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria' 
                  : 'Add students to get started'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Detail Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {selectedStudent.student_name}
              </DialogTitle>
              <DialogDescription>
                Complete student record and marks breakdown
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Student Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Student Information</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seat Number:</span>
                      <span>{selectedStudent.seat_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span>{selectedStudent.gender === 'Male' ? 'M' : selectedStudent.gender === 'Female' ? 'F' : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Result:</span>
                      <Badge variant={selectedStudent.result === 'P' ? 'default' : 'destructive'}>
                        {selectedStudent.result === 'P' ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Performance Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pointer:</span>
                      <Badge className="bg-primary">{selectedStudent.total_cgpa?.toFixed(2) || '0.00'}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject-wise Marks */}
              <div>
                <h4 className="font-semibold mb-3">Subject-wise Marks</h4>
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <div key={subject.key} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">{subject.name}</h5>
                        <Badge variant="outline">
                          Total: {selectedStudent[`${subject.key}_total` as keyof Student]}/100
                        </Badge>
                      </div>
                      <div className={`grid ${subject.hasTW ? 'grid-cols-4' : 'grid-cols-3'} gap-4 text-sm`}>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SE:</span>
                          <span>{selectedStudent[`${subject.key}_se` as keyof Student]}/80</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">IA:</span>
                          <span>{selectedStudent[`${subject.key}_ia` as keyof Student]}/20</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total:</span>
                          <span>{selectedStudent[`${subject.key}_total` as keyof Student]}/100</span>
                        </div>
                        {subject.hasTW && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">TW:</span>
                            <span>{selectedStudent.math_iv_tw}/25</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => onEditStudent(selectedStudent)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Student
                </Button>
                <Button onClick={() => setSelectedStudent(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
