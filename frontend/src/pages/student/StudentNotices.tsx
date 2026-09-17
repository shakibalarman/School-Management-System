import { useQuery } from "@tanstack/react-query";
import { Bell, FileText } from "lucide-react";
import { getMyNotices } from "../../services/studentPortal";

export function StudentNoticesPage() {
  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["student-notices"],
    queryFn: getMyNotices,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notices</h1>
        <p className="text-sm text-slate-500 mt-1">School announcements and updates.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Bell size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No notices available.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">{n.title}</h3>
                  <p className="text-sm text-slate-600 mb-2 whitespace-pre-wrap">{n.content}</p>
                  <p className="text-xs text-slate-400">
                    {n.created_at ? new Date(n.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric",
                    }) : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
