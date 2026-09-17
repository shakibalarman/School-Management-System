import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, DollarSign, Award, TrendingUp, Bell, Calendar } from "lucide-react";
import { getMyDashboard, getMyProfile } from "../../services/studentPortal";

export function StudentDashboardPage() {
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: getMyDashboard,
  });

  const { data: profile } = useQuery({
    queryKey: ["student-profile"],
    queryFn: getMyProfile,
  });

  if (dashLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Attendance",
      value: `${dashboard?.attendance.percentage ?? 0}%`,
      icon: <ClipboardCheck size={24} />,
      color: "from-green-500 to-emerald-600",
      bgLight: "bg-green-50",
    },
    {
      label: "Fees Pending",
      value: `৳${(dashboard?.fees.pending ?? 0).toLocaleString()}`,
      icon: <DollarSign size={24} />,
      color: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50",
    },
    {
      label: "Marks Entered",
      value: dashboard?.marks_count ?? 0,
      icon: <Award size={24} />,
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50",
    },
    {
      label: "Exams",
      value: dashboard?.upcoming_exams ?? 0,
      icon: <Calendar size={24} />,
      color: "from-purple-500 to-pink-600",
      bgLight: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {profile?.first_name ?? "Student"}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {profile?.class?.name ?? "—"} {profile?.section?.name ? `- Section ${profile.section.name}` : ""}
          {profile?.roll_number ? ` | Roll #${profile.roll_number}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Attendance Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Present</span>
              <span className="font-medium text-green-600">{dashboard?.attendance.present ?? 0} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Absent</span>
              <span className="font-medium text-red-600">{dashboard?.attendance.absent ?? 0} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total</span>
              <span className="font-medium text-slate-800">{dashboard?.attendance.total ?? 0} days</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all"
                style={{ width: `${dashboard?.attendance.percentage ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={18} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-800">Fee Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Fees</span>
              <span className="font-medium text-slate-800">৳{(dashboard?.fees.total ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Paid</span>
              <span className="font-medium text-green-600">৳{(dashboard?.fees.paid ?? 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pending</span>
              <span className="font-medium text-amber-600">৳{(dashboard?.fees.pending ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Bell size={20} />
          <h3 className="font-semibold">Quick Links</h3>
        </div>
        <p className="text-sm text-white/80">
          Check your attendance, view exam results, and track fee payments from the sidebar menu.
        </p>
      </div>
    </div>
  );
}
