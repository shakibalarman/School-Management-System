import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Placeholder, StudentsPage } from "./pages/Modules";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="teachers" element={<ProtectedRoute roles={["admin"]}><Placeholder title="Teachers" /></ProtectedRoute>} />
              <Route path="classes" element={<Placeholder title="Classes" />} />
              <Route path="subjects" element={<Placeholder title="Subjects" />} />
              <Route path="attendance" element={<Placeholder title="Attendance" />} />
              <Route path="exams" element={<Placeholder title="Exams" />} />
              <Route path="results" element={<Placeholder title="Results" />} />
              <Route path="fees" element={<Placeholder title="Fees" />} />
              <Route path="settings" element={<Placeholder title="Settings" />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
