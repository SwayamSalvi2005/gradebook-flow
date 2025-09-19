import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Plus, LogOut, Settings, Trash2, Users, BarChart3 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    database_name: "",
    graduation_year: "",
    year_classification: "1st Year",
    semester: 1,
    batch: "",
    branch: "Computer Eng." as BranchType,
  });

  if (!user) {
    navigate("/teacher-auth");
    return null;
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
    // Validate batch format (YYYY - YYYY, years after 2020, exactly 4 years apart)
    const batchPattern = /^20[2-9][0-9] - 20[2-9][0-9]$/;
    if (!batchPattern.test(formData.batch)) {
      toast({
        title: "Invalid Batch Format",
        description: "Batch must be in format 'YYYY - YYYY' with years after 2020",
        variant: "destructive",
      });
      return;
    }

    const [startYear, endYear] = formData.batch.split(' - ').map(year => parseInt(year));
    if (endYear - startYear !== 4) {
      toast({
        title: "Invalid Batch Years",
        description: "Batch years must be exactly 4 years apart (e.g., 2023 - 2027)",
        variant: "destructive",
      });
      return;
    }

    if (startYear < 2020 || endYear < 2024) {
      toast({
        title: "Invalid Batch Years",
        description: "Batch years must be after 2020",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('academic_databases')
      .insert([
        {
          database_name: formData.database_name,
          graduation_year: formData.graduation_year,
          year_classification: formData.year_classification,
          semester: formData.semester,
          branch: formData.branch,
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
      setIsDialogOpen(false);
      setFormData({ 
        database_name: "", 
        graduation_year: "", 
        year_classification: "1st Year", 
        semester: 1, 
        branch: "Computer Eng.", 
        batch: "" 
      });
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

  const handleAnalysis = (databaseId: string) => {
    navigate(`/analysis/${databaseId}`);
  };

  const handleManageStudents = (databaseId: string) => {
    navigate(`/manage-students/${databaseId}`);
  };

  const handleDeleteDatabase = async (databaseId: string, databaseName: string) => {
    try {
      // First delete all students in this database
      const { error: studentsError } = await supabase
        .from("students")
        .delete()
        .eq("academic_database_id", databaseId);

      if (studentsError) {
        console.error("Error deleting students:", studentsError);
        toast({
          title: "Error",
          description: "Failed to delete students from database",
          variant: "destructive",
        });
        return;
      }

      // Then delete the database
      const { error: databaseError } = await supabase
        .from("academic_databases")
        .delete()
        .eq("id", databaseId);

      if (databaseError) {
        console.error("Error deleting database:", databaseError);
        toast({
          title: "Error",
          description: "Failed to delete database",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Database "${databaseName}" deleted successfully`,
      });

      // Refresh the databases list
      fetchDatabases();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Teacher Dashboard</h1>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics and Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Statistics Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{databases.length}</div>
              <p className="text-muted-foreground">Total Academic Databases</p>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{user?.email}</p>
              <p className="text-muted-foreground">Teacher Account</p>
            </CardContent>
          </Card>
        </div>

        {/* Academic Databases Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Academic Databases</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Database
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Academic Database</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDatabase} className="space-y-4">
                  <div>
                    <Label htmlFor="database_name">Database Name</Label>
                    <Input
                      id="database_name"
                      value={formData.database_name}
                      onChange={(e) => setFormData({ ...formData, database_name: e.target.value })}
                      placeholder="e.g., CMPN - 2"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    <Input
                      id="graduation_year"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                      placeholder="e.g., 2027"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="year_classification">Year</Label>
                    <Select
                      value={formData.year_classification}
                      onValueChange={(value) => setFormData({ ...formData, year_classification: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={formData.semester.toString()}
                      onValueChange={(value) => setFormData({ ...formData, semester: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
              <Label htmlFor="batch">Batch (Format: YYYY - YYYY)</Label>
              <Input
                id="batch"
                placeholder="e.g., 2023 - 2027"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                pattern="20[2-9][0-9] - 20[2-9][0-9]"
                title="Format: YYYY - YYYY (years after 2020, exactly 4 years apart)"
                required
              />
                  </div>
                  <div>
                    <Label htmlFor="branch">Branch</Label>
                    <Select
                      value={formData.branch}
                      onValueChange={(value) => setFormData({ ...formData, branch: value as BranchType })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {branches.map((branch) => (
                          <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating..." : "Create Database"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {databases.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No academic databases found</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Create your first database</Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {databases.map((database) => (
                <Card key={database.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{database.database_name}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Branch:</span> {database.branch}
                          </div>
                          <div>
                            <span className="font-medium">Batch:</span> {database.batch}
                          </div>
                          <div>
                            <span className="font-medium">Year:</span> {database.year_classification}
                          </div>
                          <div>
                            <span className="font-medium">Semester:</span> {database.semester}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => handleManageStudents(database.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Manage Students
                        </Button>
                        <Button
                          onClick={() => handleAnalysis(database.id)}
                          variant="outline"
                          size="sm"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Analysis
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Database</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{database.database_name}"? This will permanently delete all student records in this database. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDatabase(database.id, database.database_name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Database
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;