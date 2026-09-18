import { api } from "../lib/api";

export interface Homework {
  id: string;
  title: string;
  description: string | null;
  class_id: string;
  class_name: string | null;
  subject_id: string | null;
  subject_name: string | null;
  due_date: string | null;
  created_at: string | null;
}

export async function listHomework(classId?: string): Promise<Homework[]> {
  const params = classId ? { class_id: classId } : {};
  const { data } = await api.get("/homework", { params });
  return data;
}

export async function createHomework(hw: {
  title: string;
  description?: string;
  class_id: string;
  subject_id?: string;
  due_date?: string;
}): Promise<Homework> {
  const { data } = await api.post("/homework", hw);
  return data;
}

export async function deleteHomework(id: string): Promise<void> {
  await api.delete(`/homework/${id}`);
}
