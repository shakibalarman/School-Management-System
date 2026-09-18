import { api } from "../lib/api";

export interface Notice {
  id: string;
  title: string;
  content: string;
  target_role: string;
  class_id: string | null;
  published: boolean;
  created_at: string | null;
}

export async function listNotices(): Promise<Notice[]> {
  const { data } = await api.get("/notices");
  return data;
}

export async function createNotice(notice: {
  title: string;
  content: string;
  target_role?: string;
  class_id?: string;
  published?: boolean;
}): Promise<Notice> {
  const { data } = await api.post("/notices", notice);
  return data;
}

export async function updateNotice(id: string, notice: Partial<Notice>): Promise<Notice> {
  const { data } = await api.patch(`/notices/${id}`, notice);
  return data;
}

export async function deleteNotice(id: string): Promise<void> {
  await api.delete(`/notices/${id}`);
}
