import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth, type Role } from "./AuthContext";

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: Role[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === "student") return <Navigate to="/student" replace />;
    if (user.role === "head_teacher") return <Navigate to="/teachers" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
