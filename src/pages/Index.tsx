import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, ArrowRight, Database, Upload, BarChart3 } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full gradient-primary">
              <GraduationCap className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Student Management System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comprehensive platform for managing student records, marks, and academic performance with powerful analytics
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Teacher Portal</h3>
                <p className="text-muted-foreground text-center">
                  Manage student databases, upload marks, generate reports, and analyze performance
                </p>
                <Button asChild className="w-full mt-4">
                  <Link to="/teacher-auth">
                    Access Teacher Portal
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50">
            <CardContent className="p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Student Portal</h3>
                <p className="text-muted-foreground text-center">
                  Search and download your marksheet using seat number and academic details
                </p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/student-portal">
                    Check My Results
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-full bg-secondary">
                <Database className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h4 className="font-semibold">Database Management</h4>
              <p className="text-sm text-muted-foreground text-center">
                Create and manage multiple academic databases by year, semester, and branch
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-full bg-secondary">
                <Upload className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h4 className="font-semibold">Bulk Upload</h4>
              <p className="text-sm text-muted-foreground text-center">
                Upload student data via Excel/CSV files with validation and error handling
              </p>
            </div>
            
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-full bg-secondary">
                <BarChart3 className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h4 className="font-semibold">Analytics</h4>
              <p className="text-sm text-muted-foreground text-center">
                Comprehensive analytics with pass/fail rates, toppers, and demographic insights
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
