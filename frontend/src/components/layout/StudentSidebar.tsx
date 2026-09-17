import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Award,
  DollarSign,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  School,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/student", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { to: "/student/profile", label: "Profile", icon: <User size={20} /> },
  { to: "/student/subjects", label: "Subjects", icon: <BookOpen size={20} /> },
  { to: "/student/schedule", label: "Schedule", icon: <Calendar size={20} /> },
  { to: "/student/attendance", label: "Attendance", icon: <ClipboardCheck size={20} /> },
  { to: "/student/exams", label: "Exams & Results", icon: <Award size={20} /> },
  { to: "/student/fees", label: "Fees & Payments", icon: <DollarSign size={20} /> },
  { to: "/student/notices", label: "Notices", icon: <Bell size={20} /> },
];

interface StudentSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function StudentSidebar({ collapsed, onToggle }: StudentSidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-slate-200 z-40 flex flex-col transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
          <School size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-slate-800 text-lg whitespace-nowrap">SchoolMentor</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {!collapsed && (
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Student Portal
          </p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/student"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              } ${collapsed ? "justify-center" : ""}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.email?.charAt(0).toUpperCase() ?? "S"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{user?.email}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title="Logout"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
