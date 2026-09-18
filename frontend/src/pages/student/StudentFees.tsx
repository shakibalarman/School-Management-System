import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, CreditCard, Receipt } from "lucide-react";
import { getMyFees, type StudentFee } from "../../services/studentPortal";

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  paid: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: <CheckCircle size={14} />, label: "Paid" },
  partial: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <Clock size={14} />, label: "Partial" },
  pending: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <AlertCircle size={14} />, label: "Pending" },
  overdue: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <AlertCircle size={14} />, label: "Overdue" },
};

const CATEGORY_ICONS: Record<string, string> = {
  tuition: "📚",
  exam: "📝",
  library: "📖",
  transport: "🚌",
  admission: "🎓",
  other: "📋",
};

function PaymentProgress({ total, paid }: { total: number; paid: number }) {
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;
  const color = pct >= 100 ? "bg-green-500" : pct > 0 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-slate-500 mb-1">
        <span>৳{paid.toLocaleString()}</span>
        <span>৳{total.toLocaleString()}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-slate-400 mt-0.5 text-right">{pct.toFixed(0)}%</p>
    </div>
  );
}

function FeeCard({ fee, isExpanded, onToggle }: { fee: StudentFee; isExpanded: boolean; onToggle: () => void }) {
  const style = STATUS_CONFIG[fee.status] || STATUS_CONFIG.pending;
  const icon = CATEGORY_ICONS[fee.category] || "📋";
  return (
    <div className={`rounded-2xl border ${style.border} overflow-hidden transition-all`}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors text-left">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-800 capitalize">{fee.category.replace("_", " ")}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${style.bg} ${style.text} border ${style.border}`}>
              {style.icon} {style.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Due: {fee.due_date || "N/A"}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-slate-800">৳{fee.total_amount.toLocaleString()}</p>
          {fee.due_amount > 0 && (
            <p className="text-xs text-red-500 font-medium">Due: ৳{fee.due_amount.toLocaleString()}</p>
          )}
        </div>
        <div className="shrink-0 text-slate-400">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <PaymentProgress total={fee.total_amount} paid={fee.paid_amount} />
      </div>

      {/* Expanded: Payment History */}
      {isExpanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
          {fee.payments.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">No payments made yet.</p>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Payment History</p>
              {fee.payments.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-slate-100">
                  <div className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <CreditCard size={12} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700">৳{p.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400">
                      {p.payment_method ? p.payment_method.replace("_", " ") : "N/A"}
                      {p.transaction_ref && ` • ${p.transaction_ref}`}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-500 shrink-0">{p.payment_date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StudentFeesPage() {
  const { data: fees = [], isLoading } = useQuery({
    queryKey: ["student-fees"],
    queryFn: getMyFees,
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalDue = fees.reduce((sum, f) => sum + f.due_amount, 0);
  const totalPaid = fees.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalAmount = fees.reduce((sum, f) => sum + f.total_amount, 0);
  const paidCount = fees.filter((f) => f.status === "paid").length;
  const pendingCount = fees.filter((f) => f.status === "pending" || f.status === "overdue").length;
  const partialCount = fees.filter((f) => f.status === "partial").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Fees & Payments</h1>
        <p className="text-sm text-slate-500 mt-1">View your fee invoices, payment progress, and history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Receipt size={16} className="text-indigo-600" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Total Fees</p>
          </div>
          <p className="text-xl font-bold text-slate-800">৳{totalAmount.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">{fees.length} invoices</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle size={16} className="text-green-600" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Paid</p>
          </div>
          <p className="text-xl font-bold text-green-600">৳{totalPaid.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">{paidCount} fully paid</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Clock size={16} className="text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Due</p>
          </div>
          <p className="text-xl font-bold text-amber-600">৳{totalDue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">{pendingCount + partialCount} pending/partial</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <DollarSign size={16} className="text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Overall Progress</p>
          </div>
          <p className="text-xl font-bold text-purple-600">
            {totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(0) : 0}%
          </p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Fee Cards */}
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
        <div className="space-y-3">
          {fees.map((f) => (
            <FeeCard
              key={f.id}
              fee={f}
              isExpanded={expandedId === f.id}
              onToggle={() => setExpandedId(expandedId === f.id ? null : f.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
