import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  LogOut, 
  Database, 
  Users, 
  BarChart3, 
  BookOpen,
  Calendar,
  Building,
  GraduationCap,
  User,
  Upload,
  Download
} from 'lucide-react';

type BranchType = 'Computer Eng.' | 'Electronics and Telecom' | 'Information Technology' | 'Electronics and Computer Science' | 'Electrical';

const branches: BranchType[] = [
  'Computer Eng.',
  'Electronics and Telecom',
  'Information Technology',
  'Electronics and Computer Science',
  'Electrical'
];

interface AcademicDatabase {
  id: string;
  database_name: string;
  graduation_year: string;
  year_classification: string;
  semester: number;
  branch: string;
  batch: string;
  created_at: string;
}

const TeacherDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [databases, setDatabases] = useState<AcademicDatabase[]>([]);
  const [loading, setLoading] = useState(false);
  const [createDbOpen, setCreateDbOpen] = useState(false);
  const [formData, setFormData] = useState({
    databaseName: '',
    graduationYear: '',
    yearClassification: '',
    semester: '',
    branch: '' as BranchType | '',
    batch: ''
  });

  if (!user) {
    return <Navigate to="/teacher-auth" replace />;
  }

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    const { data, error } = await supabase
      .from('academic_databases')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch databases",
        variant: "destructive",
      });
    } else {
      setDatabases(data || []);
    }
  };

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from('academic_databases')
      .insert([
        {
          database_name: formData.databaseName,
          graduation_year: formData.graduationYear,
          year_classification: formData.yearClassification,
          semester: parseInt(formData.semester),
          branch: formData.branch as BranchType,
          batch: formData.batch,
          created_by: user.id
        }
      ]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Academic database created successfully!",
      });
      setCreateDbOpen(false);
      setFormData({ databaseName: '', graduationYear: '', yearClassification: '', semester: '', branch: '', batch: '' });
      fetchDatabases();
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully.",
    });
  };

  const getSemesterYear = (semester: number) => {
    if (semester <= 2) return '1st Year';
    if (semester <= 4) return '2nd Year';
    return '3rd Year';
  };

  const handleManageStudents = (databaseId: string) => {
    navigate(`/manage-students/${databaseId}`);
  };

  const handleAnalysis = (databaseId: string) => {
    navigate(`/analysis/${databaseId}`);
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Teacher Dashboard</h1>
                <p className="text-sm text-muted-foreground">Student Management System</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Academic Databases</h2>
              <p className="text-muted-foreground">Manage your student databases and records</p>
            </div>
            
            <Dialog open={createDbOpen} onOpenChange={setCreateDbOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Database
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Marks Database</DialogTitle>
                  <DialogDescription>
                    Set up a new database for managing student records
                  </DialogDescription>
                </DialogHeader>
                  <form onSubmit={handleCreateDatabase} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="databaseName">Database Name</Label>
                      <Input
                        id="databaseName"
                        placeholder="e.g., Final Semester Database"
                        value={formData.databaseName}
                        onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Input
                        id="graduationYear"
                        placeholder="e.g., 2027"
                        value={formData.graduationYear}
                        onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="yearClassification">Year Classification</Label>
                      <Select
                        value={formData.yearClassification}
                        onValueChange={(value) => setFormData({ ...formData, yearClassification: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Select
                        value={formData.semester}
                        onValueChange={(value) => setFormData({ ...formData, semester: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                      <Label htmlFor="batch">Batch Range</Label>
                      <Input
                        id="batch"
                        placeholder="e.g., 2023-2027"
                        value={formData.batch}
                        onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                        required
                      />
                    </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setCreateDbOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Creating...' : 'Create Database'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {databases.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Databases Created</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first academic database to start managing student records
                </p>
                <Button onClick={() => setCreateDbOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Database
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {databases.map((db) => (
                <Card key={db.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{db.database_name}</span>
                      <Badge variant="secondary">{db.branch.split(' ')[0]}</Badge>
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {db.graduation_year} • {db.year_classification}
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        Semester {db.semester}
                      </div>
                      <div className="flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        Batch {db.batch}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Branch:</span>
                      <span className="font-medium">{db.branch}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleManageStudents(db.id)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Manage Students
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAnalysis(db.id)}
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{databases.length}</div>
                <p className="text-muted-foreground">Total Databases</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-muted-foreground">Teacher Account</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;