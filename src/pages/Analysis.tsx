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
  Target
} from 'lucide-react';

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
  academic_year: string;
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
  topper: Student | null;
  averageCGPA: number;
  highestTotal: number;
  lowestTotal: number;
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
        topper: null,
        averageCGPA: 0,
        highestTotal: 0,
        lowestTotal: 0
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

    // Find topper (highest CGPA)
    const topper = studentsData.reduce((max, student) => 
      student.total_cgpa > (max?.total_cgpa || 0) ? student : max
    , studentsData[0]);

    // Calculate averages and extremes
    const averageCGPA = studentsData.reduce((sum, s) => sum + s.total_cgpa, 0) / studentsData.length;
    const totals = studentsData.map(calculateTotal);
    const highestTotal = Math.max(...totals);
    const lowestTotal = Math.min(...totals);

    setAnalytics({
      totalStudents: studentsData.length,
      maleStudents,
      femaleStudents,
      otherGender,
      passedStudents,
      failedStudents,
      topper,
      averageCGPA,
      highestTotal,
      lowestTotal
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
                <span>{database.academic_year}</span>
                <Badge variant="secondary">Semester {database.semester}</Badge>
                <span>{database.branch}</span>
                <span>Batch {database.batch}</span>
              </div>
            </div>
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
                    <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.highestTotal}</div>
                    <p className="text-xs text-muted-foreground">Out of 550 marks</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Topper Information */}
                {analytics.topper && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                        Class Topper
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-lg">{analytics.topper.student_name}</div>
                          <div className="text-muted-foreground">Seat No: {analytics.topper.seat_number}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{analytics.topper.total_cgpa}</div>
                          <div className="text-sm text-muted-foreground">CGPA</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Marks:</span>
                          <span className="font-medium">{calculateTotal(analytics.topper)}/550</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Percentage:</span>
                          <span className="font-medium">{calculatePercentage(analytics.topper).toFixed(1)}%</span>
                        </div>
                        {analytics.topper.gender && (
                          <div className="flex justify-between text-sm">
                            <span>Gender:</span>
                            <span className="font-medium">{analytics.topper.gender}</span>
                          </div>
                        )}
                      </div>
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

                {/* Score Range Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                      Score Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Highest Total:</span>
                        <span className="font-medium">{analytics.highestTotal}/550</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lowest Total:</span>
                        <span className="font-medium">{analytics.lowestTotal}/550</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Score Range:</span>
                        <span className="font-medium">{analytics.highestTotal - analytics.lowestTotal} marks</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Highest Percentage:</span>
                        <span className="font-medium">{((analytics.highestTotal / 550) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lowest Percentage:</span>
                        <span className="font-medium">{((analytics.lowestTotal / 550) * 100).toFixed(1)}%</span>
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