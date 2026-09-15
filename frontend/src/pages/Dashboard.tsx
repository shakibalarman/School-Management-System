import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

const NAV: Record<string, { to: string; label: string }[]> = {
  admin: [
    { to: "/students", label: "Students" },
    { to: "/teachers", label: "Teachers" },
    { to: "/attendance", label: "Attendance" },
    { to: "/exams", label: "Exams" },
    { to: "/fees", label: "Fees" },
  ],
  teacher: [
    { to: "/students", label: "Students" },
    { to: "/attendance", label: "Attendance" },
    { to: "/exams", label: "Exams" },
  ],
  student: [
    { to: "/attendance", label: "My Attendance" },
    { to: "/exams", label: "My Results" },
  ],
  guardian: [
    { to: "/attendance", label: "Attendance" },
    { to: "/fees", label: "Fees" },
  ],
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const role = user?.role ?? "student";
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => (await api.get("/../health")).data,
    retry: false,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold">SMS · {role} dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button onClick={logout} className="text-sm border rounded px-3 py-1">
            Logout
          </button>
        </div>
      </header>
      <main className="p-6 grid gap-4 max-w-3xl">
        <p className="text-sm text-slate-600">
          API: {(health.data as { status?: string })?.status ?? health.error ? "unreachable" : "checking…"}
        </p>
        <nav className="grid gap-2">
          {(NAV[role] ?? []).map((n) => (
            <Link key={n.to} to={n.to} className="bg-white border rounded p-4 hover:bg-slate-100">
              {n.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
