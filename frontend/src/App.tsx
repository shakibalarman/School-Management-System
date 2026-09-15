import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Placeholder, StudentsPage } from "./pages/Modules";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute roles={["admin"]}><Placeholder title="Teachers" /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Placeholder title="Attendance" /></ProtectedRoute>} />
            <Route path="/exams" element={<ProtectedRoute><Placeholder title="Exams & Results" /></ProtectedRoute>} />
            <Route path="/fees" element={<ProtectedRoute><Placeholder title="Fees" /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
