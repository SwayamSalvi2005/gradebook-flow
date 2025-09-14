import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TeacherAuth from "./pages/TeacherAuth";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentPortal from "./pages/StudentPortal";
import ManageStudents from "./pages/ManageStudents";
import Analysis from "./pages/Analysis";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/teacher-auth" element={<TeacherAuth />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/manage-students/:databaseId" element={<ManageStudents />} />
            <Route path="/analysis/:databaseId" element={<Analysis />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
