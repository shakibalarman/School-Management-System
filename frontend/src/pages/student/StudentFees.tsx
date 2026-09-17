import { useQuery } from "@tanstack/react-query";
import { DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { getMyFees } from "../../services/studentPortal";

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  paid: { bg: "bg-green-50 border-green-100", text: "text-green-700", icon: <CheckCircle size={14} /> },
  partial: { bg: "bg-yellow-50 border-yellow-100", text: "text-yellow-700", icon: <Clock size={14} /> },
  pending: { bg: "bg-red-50 border-red-100", text: "text-red-700", icon: <AlertCircle size={14} /> },
  overdue: { bg: "bg-red-50 border-red-100", text: "text-red-700", icon: <AlertCircle size={14} /> },
};

export function StudentFeesPage() {
  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["student-fees"],
    queryFn: getMyFees,
  });

  const totalDue = fees.reduce((sum, f) => sum + f.due_amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Fees & Payments</h1>
        <p className="text-sm text-slate-500 mt-1">View your fee invoices and payment status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-800">৳{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total Paid</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">৳{totalDue.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">Total Due</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-indigo-600">{fees.length}</p>
          <p className="text-xs text-slate-500 mt-1">Total Invoices</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fees.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <DollarSign size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">No fee records found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Paid</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Due</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((f) => {
                  const style = STATUS_STYLES[f.status] || STATUS_STYLES.pending;
                  return (
                    <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-800 capitalize">{f.category.replace("_", " ")}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">৳{f.total_amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-600">৳{f.paid_amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-amber-600">৳{f.due_amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{f.due_date || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${style.bg} ${style.text}`}>
                          {style.icon}
                          {f.status.charAt(0).toUpperCase() + f.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
