import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AdminLayout } from "./components/layout/AdminLayout";
import { StudentLayout } from "./components/layout/StudentLayout";
import { StudentsPage } from "./pages/Students";
import { TeachersPage } from "./pages/Teachers";
import { SubjectsPage } from "./pages/Subjects";
import { ClassesPage } from "./pages/Classes";
import { SchedulePage } from "./pages/Schedule";
import { FeesPage } from "./pages/Fees";
import { TakeAttendancePage } from "./pages/TakeAttendance";
import { AttendanceViewPage } from "./pages/AttendanceView";
import { MyAttendancePage } from "./pages/MyAttendance";
import { ExamsPage } from "./pages/Exams";
import { NoticesPage } from "./pages/Notices";
import { AcademicYearsPage } from "./pages/AcademicYears";
import { HomeworkPage } from "./pages/Homework";
import {
  StudentDashboardPage,
  StudentProfilePage,
  StudentSubjectsPage,
  StudentSchedulePage,
  StudentAttendancePage,
  StudentExamsPage,
  StudentFeesPage,
  StudentNoticesPage,
  StudentHomeworkPage,
} from "./pages/student";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            {/* Admin / Teacher routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute roles={["admin", "head_teacher", "teacher"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="students" element={<ProtectedRoute roles={["admin", "head_teacher"]}><StudentsPage /></ProtectedRoute>} />
              <Route path="teachers" element={<ProtectedRoute roles={["admin", "head_teacher"]}><TeachersPage /></ProtectedRoute>} />
              <Route path="classes" element={<ProtectedRoute roles={["admin", "head_teacher"]}><ClassesPage /></ProtectedRoute>} />
              <Route path="subjects" element={<ProtectedRoute roles={["admin", "head_teacher"]}><SubjectsPage /></ProtectedRoute>} />
              <Route path="academic-years" element={<ProtectedRoute roles={["admin"]}><AcademicYearsPage /></ProtectedRoute>} />
              <Route path="schedule" element={<ProtectedRoute roles={["admin", "head_teacher"]}><SchedulePage /></ProtectedRoute>} />
              <Route path="fees" element={<ProtectedRoute roles={["admin"]}><FeesPage /></ProtectedRoute>} />
              <Route path="exams" element={<ProtectedRoute roles={["admin", "head_teacher", "teacher"]}><ExamsPage /></ProtectedRoute>} />
              <Route path="homework" element={<ProtectedRoute roles={["admin", "head_teacher", "teacher"]}><HomeworkPage /></ProtectedRoute>} />
              <Route path="notices" element={<ProtectedRoute roles={["admin", "head_teacher"]}><NoticesPage /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute roles={["admin", "head_teacher", "teacher"]}><TakeAttendancePage /></ProtectedRoute>} />
              <Route path="attendance/view" element={<ProtectedRoute roles={["admin", "head_teacher"]}><AttendanceViewPage /></ProtectedRoute>} />
              <Route path="attendance/my" element={<MyAttendancePage />} />
            </Route>

            {/* Student portal routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute roles={["student"]}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboardPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="subjects" element={<StudentSubjectsPage />} />
              <Route path="schedule" element={<StudentSchedulePage />} />
              <Route path="attendance" element={<StudentAttendancePage />} />
              <Route path="exams" element={<StudentExamsPage />} />
              <Route path="fees" element={<StudentFeesPage />} />
              <Route path="homework" element={<StudentHomeworkPage />} />
              <Route path="notices" element={<StudentNoticesPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
