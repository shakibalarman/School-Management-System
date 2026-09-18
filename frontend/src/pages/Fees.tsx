import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Loader2, DollarSign, Send } from "lucide-react";
import {
  listFeeCategories,
  createFeeCategory,
  deleteFeeCategory,
  bulkAssignFees,
} from "../services/fees";
import { listClasses } from "../services/classes";
import type { FeeCategory, SchoolClass } from "../types";

const FEE_TYPES = ["admission", "tuition", "exam", "library", "transport", "other"];

const categorySchema = z.object({
  name: z.string().min(1, "Required"),
  amount: z.string().min(1, "Required"),
  class_id: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});
type CategoryForm = z.infer<typeof categorySchema>;

const assignSchema = z.object({
  class_id: z.string().min(1, "Select a class"),
  fee_category_id: z.string().min(1, "Select a fee category"),
  due_date: z.string().optional().or(z.literal("")),
});
type AssignForm = z.infer<typeof assignSchema>;

export function FeesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filterClass, setFilterClass] = useState("");
  const [assignResult, setAssignResult] = useState<string | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: listClasses,
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["fee-categories", filterClass],
    queryFn: () => listFeeCategories(filterClass || undefined),
  });

  const createMut = useMutation({
    mutationFn: (values: CategoryForm) =>
      createFeeCategory({
        name: values.name,
        amount: parseFloat(values.amount),
        class_id: values.class_id || null,
        description: values.description || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-categories"] });
      setShowCreate(false);
      createReset();
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteFeeCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fee-categories"] });
      setConfirmDelete(null);
    },
  });

  const assignMut = useMutation({
    mutationFn: (values: AssignForm) =>
      bulkAssignFees({
        class_id: values.class_id,
        fee_category_id: values.fee_category_id,
        due_date: values.due_date || null,
      }),
    onSuccess: (res) => {
      setAssignResult(`Assigned to ${res.assigned} of ${res.total_students} students`);
      setTimeout(() => setAssignResult(null), 4000);
    },
  });

  const {
    register: createRegister,
    handleSubmit: createSubmit,
    reset: createReset,
    formState: { errors: createErrors },
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) });

  const {
    register: assignRegister,
    handleSubmit: assignSubmit,
    reset: assignReset,
    formState: { errors: assignErrors },
  } = useForm<AssignForm>({ resolver: zodResolver(assignSchema) });

  function onCreate(values: CategoryForm) {
    createMut.mutate(values);
  }

  function onAssign(values: AssignForm) {
    assignMut.mutate(values);
  }

  function getClassName(id: string | null) {
    if (!id) return "All Classes";
    const c = classes.find((c: SchoolClass) => c.id === id);
    return c?.name || "Unknown";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fee Management</h1>
          <p className="text-sm text-slate-500 mt-1">Create fee categories and assign fees to classes</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setShowAssign(true); setAssignResult(null); }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Send size={14} /> Assign Fees
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={14} /> Add Fee Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-slate-600 mb-1">Filter by Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map((c: SchoolClass) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-indigo-500" size={24} />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Fee Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Class</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: FeeCategory) => (
                <tr key={cat.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <DollarSign size={14} className="text-green-500" />
                      <span className="text-sm font-medium text-slate-800 capitalize">{cat.name}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                    ${cat.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      cat.class_id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {getClassName(cat.class_id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500 max-w-[200px] truncate">
                    {cat.description || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {confirmDelete === cat.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Delete?</span>
                        <button onClick={() => deleteMut.mutate(cat.id)} className="text-xs text-red-600 font-medium hover:underline">Yes</button>
                        <button onClick={() => setConfirmDelete(null)} className="text-xs text-slate-500 hover:underline">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDelete(cat.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-500">
                    No fee categories found. Click "Add Fee Category" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Add Fee Category</h2>
              <form onSubmit={createSubmit(onCreate)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fee Type *</label>
                  <select {...createRegister("name")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Type</option>
                    {FEE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  {createErrors.name && <p className="text-red-500 text-xs mt-1">{createErrors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount *</label>
                  <input type="number" step="0.01" {...createRegister("amount")} placeholder="e.g. 5000" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  {createErrors.amount && <p className="text-red-500 text-xs mt-1">{createErrors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Class</label>
                  <select {...createRegister("class_id")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">All Classes (Global)</option>
                    {classes.map((c: SchoolClass) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input {...createRegister("description")} placeholder="Optional description" className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={createMut.isPending} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                    {createMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Assign Fees to Class</h2>
              {assignResult && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {assignResult}
                </div>
              )}
              <form onSubmit={assignSubmit(onAssign)} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Class *</label>
                  <select {...assignRegister("class_id")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Class</option>
                    {classes.map((c: SchoolClass) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {assignErrors.class_id && <p className="text-red-500 text-xs mt-1">{assignErrors.class_id.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fee Category *</label>
                  <select {...assignRegister("fee_category_id")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Fee Category</option>
                    {categories.map((cat: FeeCategory) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} - ${cat.amount.toLocaleString()}
                        {cat.class_name ? ` (${cat.class_name})` : " (All)"}
                      </option>
                    ))}
                  </select>
                  {assignErrors.fee_category_id && <p className="text-red-500 text-xs mt-1">{assignErrors.fee_category_id.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Due Date</label>
                  <input type="date" {...assignRegister("due_date")} className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setShowAssign(false); assignReset(); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" disabled={assignMut.isPending} className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                    {assignMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Assign to All Students
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
