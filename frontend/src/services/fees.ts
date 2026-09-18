import { api } from "../lib/api";
import type { FeeCategory } from "../types";

export async function listFeeCategories(classId?: string): Promise<FeeCategory[]> {
  const params = classId ? { class_id: classId } : {};
  const { data } = await api.get("/fees/categories", { params });
  return data;
}

export async function createFeeCategory(payload: {
  name: string;
  amount: number;
  class_id?: string | null;
  academic_year_id?: string | null;
  description?: string;
}): Promise<{ id: string }> {
  const { data } = await api.post("/fees/categories", payload);
  return data;
}

export async function deleteFeeCategory(id: string): Promise<void> {
  await api.delete(`/fees/categories/${id}`);
}

export async function bulkAssignFees(payload: {
  class_id: string;
  fee_category_id: string;
  due_date?: string | null;
}): Promise<{ ok: boolean; assigned: number; total_students: number }> {
  const { data } = await api.post("/fees/assign", payload);
  return data;
}
