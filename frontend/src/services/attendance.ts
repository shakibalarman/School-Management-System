import { api } from "../lib/api";
import type { AttendanceRecord, StudentAttendanceSummary } from "../types";

export async function takeAttendance(payload: {
  class_id: string;
  section_id?: string;
  date: string;
  records: { student_id: string; status: string }[];
}): Promise<{ ok: boolean; count: number }> {
  const { data } = await api.post("/attendance/take", payload);
  return data;
}

export async function listAttendance(params?: {
  class_id?: string;
  section_id?: string;
  date?: string;
  student_id?: string;
  skip?: number;
  limit?: number;
}): Promise<AttendanceRecord[]> {
  const { data } = await api.get("/attendance", { params });
  return data;
}

export async function getStudentAttendance(
  studentId: string,
  month?: number,
  year?: number
): Promise<StudentAttendanceSummary> {
  const params: Record<string, number> = {};
  if (month) params.month = month;
  if (year) params.year = year;
  const { data } = await api.get(`/attendance/student/${studentId}`, { params });
  return data;
}

export async function updateAttendance(
  id: string,
  status: string
): Promise<AttendanceRecord> {
  const { data } = await api.patch(`/attendance/${id}`, { status });
  return data;
}
