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
  if (loading) return <p className="p-8">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
