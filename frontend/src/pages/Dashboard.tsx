import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Users, BookOpen, Library, ClipboardCheck, DollarSign } from "lucide-react";
import { fetchDashboardStats } from "../services/dashboard";
import { StatCard } from "../components/dashboard/StatCard";
import { DonutCard } from "../components/dashboard/DonutCard";
import { AttendanceChart } from "../components/dashboard/AttendanceChart";
import { FeeCollectionChart } from "../components/dashboard/FeeCollectionChart";

export function Dashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-sm text-red-600">Failed to load dashboard data.</p>
          <p className="text-xs text-slate-500 mt-1">Please check if the API is running.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome back! Here&apos;s your school overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.total_students ?? 0}
          icon={<GraduationCap size={48} />}
          color="blue"
        />
        <StatCard
          title="Total Teachers"
          value={stats?.total_teachers ?? 0}
          icon={<Users size={48} />}
          color="green"
        />
        <StatCard
          title="Total Classes"
          value={stats?.total_classes ?? 0}
          icon={<BookOpen size={48} />}
          color="orange"
        />
        <StatCard
          title="Total Subjects"
          value={stats?.total_subjects ?? 0}
          icon={<Library size={48} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Attendance"
          value={`${stats?.today_attendance.percentage ?? 0}%`}
          icon={<ClipboardCheck size={48} />}
          color="teal"
          subtitle={`${stats?.today_attendance.present ?? 0} present of ${stats?.today_attendance.total ?? 0}`}
        />
        <DonutCard
          title="Attendance Rate"
          percentage={stats?.today_attendance.percentage ?? 0}
          color="#6366f1"
          subtitle="Today's attendance"
        />
        <DonutCard
          title="Fee Collection"
          percentage={
            stats?.fee_collection.total_due
              ? Math.round((stats.fee_collection.total_collected / stats.fee_collection.total_due) * 100)
              : 0
          }
          color="#10b981"
          subtitle={`$${(stats?.fee_collection.total_collected ?? 0).toLocaleString()} collected`}
        />
        <StatCard
          title="Outstanding Fees"
          value={`$${(stats?.fee_collection.total_outstanding ?? 0).toLocaleString()}`}
          icon={<DollarSign size={48} />}
          color="red"
          subtitle="Pending payments"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceChart />
        <FeeCollectionChart
          collected={stats?.fee_collection.total_collected ?? 0}
          outstanding={stats?.fee_collection.total_outstanding ?? 0}
        />
      </div>
    </div>
  );
}
