import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  Trophy,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Student {
  id: string;
  seat_number: number;
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

interface AnalyticsData {
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  otherGender: number;
  passedStudents: number;
  failedStudents: number;
  toppers: Student[];
  averageCGPA: number;
  highestCGPA: number;
  lowestCGPA: number;
}

const Analysis = () => {
  const { user } = useAuth();
  const { databaseId } = useParams();
  const [database, setDatabase] = useState<AcademicDatabase | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [passThreshold] = useState(40); // Configurable pass threshold percentage

  if (!user) {
    return <Navigate to="/teacher-auth" replace />;
  }

  useEffect(() => {
    if (databaseId) {
      fetchData();
    }
  }, [databaseId]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch database details
    const { data: dbData, error: dbError } = await supabase
      .from('academic_databases')
      .select('*')
      .eq('id', databaseId)
      .single();

    if (dbError) {
      toast({
        title: "Error",
        description: "Failed to fetch database details",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setDatabase(dbData);

    // Fetch students
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('academic_database_id', databaseId);

    if (studentsError) {
      toast({
        title: "Error",
        description: "Failed to fetch students data",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    setStudents(studentsData || []);
    calculateAnalytics(studentsData || []);
    setLoading(false);
  };

  const calculateTotal = (student: Student) => {
    return (
      student.subject1_unit_test + student.subject1_sem_marks +
      student.subject2_unit_test + student.subject2_sem_marks +
      student.subject3_unit_test + student.subject3_sem_marks +
      student.subject4_unit_test + student.subject4_sem_marks +
      student.subject5_unit_test + student.subject5_sem_marks
    );
  };

  const calculatePercentage = (student: Student) => {
    const total = calculateTotal(student);
    return (total / 550) * 100; // 550 is the maximum possible marks (5 subjects × 110 marks each)
  };

  const calculateAnalytics = (studentsData: Student[]) => {
    if (studentsData.length === 0) {
      setAnalytics({
        totalStudents: 0,
        maleStudents: 0,
        femaleStudents: 0,
        otherGender: 0,
        passedStudents: 0,
        failedStudents: 0,
        toppers: [],
        averageCGPA: 0,
        highestCGPA: 0,
        lowestCGPA: 0
      });
      return;
    }

    // Gender distribution
    const maleStudents = studentsData.filter(s => s.gender === 'Male').length;
    const femaleStudents = studentsData.filter(s => s.gender === 'Female').length;
    const otherGender = studentsData.filter(s => s.gender === 'Other').length;

    // Pass/Fail analysis
    const passedStudents = studentsData.filter(s => calculatePercentage(s) >= passThreshold).length;
    const failedStudents = studentsData.length - passedStudents;

    // Find top 3 toppers (highest CGPA)
    const sortedByCGPA = [...studentsData].sort((a, b) => b.total_cgpa - a.total_cgpa);
    const highestCGPA = sortedByCGPA[0]?.total_cgpa || 0;
    const toppers = sortedByCGPA.filter(student => student.total_cgpa === highestCGPA).slice(0, 3);

    // Calculate averages and extremes
    const averageCGPA = studentsData.reduce((sum, s) => sum + s.total_cgpa, 0) / studentsData.length;
    const cgpaValues = studentsData.map(s => s.total_cgpa);
    const lowestCGPA = Math.min(...cgpaValues);

    setAnalytics({
      totalStudents: studentsData.length,
      maleStudents,
      femaleStudents,
      otherGender,
      passedStudents,
      failedStudents,
      toppers,
      averageCGPA,
      highestCGPA,
      lowestCGPA
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div>Loading analytics...</div>
    </div>;
  }

  if (!database || !analytics) {
    return <div>Error loading data</div>;
  }

  const passPercentage = analytics.totalStudents > 0 ? 
    ((analytics.passedStudents / analytics.totalStudents) * 100).toFixed(1) : '0';

  const exportToPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Analytics Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Database: ${database?.database_name}`, 20, 35);
    doc.text(`Branch: ${database?.branch}`, 20, 45);
    doc.text(`Year: ${database?.year_classification}`, 20, 55);
    doc.text(`Semester: ${database?.semester}`, 20, 65);
    
    doc.text(`Total Students: ${analytics.totalStudents}`, 20, 85);
    doc.text(`Pass Rate: ${passPercentage}%`, 20, 95);
    doc.text(`Average CGPA: ${analytics.averageCGPA.toFixed(2)}`, 20, 105);
    doc.text(`Highest CGPA: ${analytics.highestCGPA}`, 20, 115);
    
    if (analytics.toppers.length > 0) {
      doc.text('Top Performers:', 20, 135);
      analytics.toppers.forEach((topper, index) => {
        doc.text(`${index + 1}. ${topper.student_name} - CGPA: ${topper.total_cgpa}`, 25, 145 + (index * 10));
      });
    }
    
    doc.save('analytics-report.pdf');
  };

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
              <h1 className="text-3xl font-bold flex items-center">
                <BarChart3 className="mr-3 h-8 w-8 text-primary" />
                Analytics Dashboard
              </h1>
              <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                <span>{database.database_name}</span>
                <Badge variant="secondary">{database.graduation_year}</Badge>
                <span>{database.year_classification}</span>
                <Badge variant="outline">Semester {database.semester}</Badge>
                <span>{database.branch}</span>
                <span>Batch {database.batch}</span>
              </div>
            </div>
            
            <Button onClick={exportToPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Export PDF Report
            </Button>
          </div>

          {analytics.totalStudents === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Data Available</h3>
                <p className="text-muted-foreground text-center">
                  Add students to this database to view analytics
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Enrolled students</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{passPercentage}%</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.passedStudents}/{analytics.totalStudents} passed
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average CGPA</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageCGPA.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Class average</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Highest CGPA</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.highestCGPA}</div>
                    <p className="text-xs text-muted-foreground">Top performer</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 3 Toppers */}
                {analytics.toppers.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                        Top 3 Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analytics.toppers.slice(0, 3).map((topper, index) => (
                        <div key={topper.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">{topper.student_name}</div>
                              <div className="text-sm text-muted-foreground">Seat No: {topper.seat_number}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{topper.total_cgpa}</div>
                            <div className="text-xs text-muted-foreground">CGPA</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Gender Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="mr-2 h-5 w-5 text-primary" />
                      Gender Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                          <span>Male Students</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{analytics.maleStudents}</span>
                          <span className="text-sm text-muted-foreground">
                            ({analytics.totalStudents > 0 ? ((analytics.maleStudents / analytics.totalStudents) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
                          <span>Female Students</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{analytics.femaleStudents}</span>
                          <span className="text-sm text-muted-foreground">
                            ({analytics.totalStudents > 0 ? ((analytics.femaleStudents / analytics.totalStudents) * 100).toFixed(1) : 0}%)
                          </span>
                        </div>
                      </div>

                      {analytics.otherGender > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                            <span>Other</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{analytics.otherGender}</span>
                            <span className="text-sm text-muted-foreground">
                              ({((analytics.otherGender / analytics.totalStudents) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pass/Fail Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5 text-primary" />
                      Pass/Fail Analysis
                    </CardTitle>
                    <CardDescription>
                      Based on {passThreshold}% pass threshold
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <UserCheck className="mr-2 h-4 w-4 text-green-500" />
                          <span>Passed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-green-600">{analytics.passedStudents}</span>
                          <span className="text-sm text-muted-foreground">({passPercentage}%)</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <UserX className="mr-2 h-4 w-4 text-red-500" />
                          <span>Failed</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-red-600">{analytics.failedStudents}</span>
                          <span className="text-sm text-muted-foreground">
                            ({(100 - parseFloat(passPercentage)).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground mb-2">Pass Rate Progress</div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${passPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              {/* CGPA Range Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                    CGPA Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Highest CGPA:</span>
                      <span className="font-medium">{analytics.highestCGPA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lowest CGPA:</span>
                      <span className="font-medium">{analytics.lowestCGPA}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGPA Range:</span>
                      <span className="font-medium">{(analytics.highestCGPA - analytics.lowestCGPA).toFixed(2)} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average CGPA:</span>
                      <span className="font-medium">{analytics.averageCGPA.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analysis;