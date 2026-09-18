import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  FileText,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  School,
  Eye,
  User,
  Clock,
  Bell,
  Calendar,
  BookOpenCheck,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  teacherOnly?: boolean;
  studentOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "",
    items: [{ to: "/", label: "Dashboard", icon: <LayoutDashboard size={20} /> }],
  },
  {
    label: "People",
    items: [
      { to: "/students", label: "Students", icon: <GraduationCap size={20} /> },
      { to: "/teachers", label: "Teachers", icon: <Users size={20} />, adminOnly: true },
      { to: "/my-classes", label: "My Classes", icon: <BookOpen size={20} />, teacherOnly: true },
    ],
  },
  {
    label: "Academic",
    items: [
      { to: "/classes", label: "Classes", icon: <BookOpen size={20} /> },
      { to: "/subjects", label: "Subjects", icon: <BookOpen size={20} /> },
      { to: "/academic-years", label: "Academic Years", icon: <Calendar size={20} />, adminOnly: true },
      { to: "/schedule", label: "Class Routine", icon: <Clock size={20} />, adminOnly: true },
      { to: "/my-routine", label: "My Routine", icon: <Clock size={20} />, teacherOnly: true },
    ],
  },
  {
    label: "Attendance",
    items: [
      { to: "/attendance", label: "Take Attendance", icon: <ClipboardCheck size={20} /> },
      { to: "/attendance/view", label: "View Attendance", icon: <Eye size={20} />, adminOnly: true },
      { to: "/attendance/my", label: "My Attendance", icon: <User size={20} />, studentOnly: true },
    ],
  },
  {
    label: "Examination",
    items: [
      { to: "/exams", label: "Exams", icon: <FileText size={20} /> },
      { to: "/results", label: "Results", icon: <BarChart3 size={20} /> },
      { to: "/homework", label: "Homework", icon: <BookOpenCheck size={20} /> },
    ],
  },
  {
    label: "Finance",
    items: [{ to: "/fees", label: "Fees", icon: <DollarSign size={20} />, adminOnly: true }],
  },
  {
    label: "Communication",
    items: [{ to: "/notices", label: "Notices", icon: <Bell size={20} /> }],
  },
  {
    label: "System",
    items: [{ to: "/settings", label: "Settings", icon: <Settings size={20} /> }],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isHeadTeacher = user?.role === "head_teacher";
  const isStudent = user?.role === "student";

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
          <span className="font-bold text-slate-800 text-lg whitespace-nowrap">
            SchoolMentor
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.adminOnly && !isAdmin && !isHeadTeacher) return false;
            if (item.teacherOnly && user?.role !== "teacher" && !isAdmin && !isHeadTeacher) return false;
            if (item.studentOnly && !isStudent) return false;
            return true;
          });
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className="mb-4">
              {group.label && !collapsed && (
                <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </p>
              )}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
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
            </div>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
