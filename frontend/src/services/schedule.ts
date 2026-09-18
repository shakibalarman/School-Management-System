import { api } from "../lib/api";
import type { ScheduleEntry, DayOfWeek } from "../types";

export async function listSchedules(params?: {
  teacher_id?: string;
  class_id?: string;
  day?: DayOfWeek;
}): Promise<ScheduleEntry[]> {
  const { data } = await api.get("/schedules", { params });
  return data;
}

export async function getSchedule(id: string): Promise<ScheduleEntry> {
  const { data } = await api.get(`/schedules/${id}`);
  return data;
}

export async function createSchedule(
  teacherId: string,
  payload: {
    class_id: string;
    section_id?: string | null;
    subject_id: string;
    day_of_week: DayOfWeek;
    period_number: number;
    start_time: string;
    end_time: string;
  },
): Promise<ScheduleEntry> {
  const { data } = await api.post(`/schedules/teacher/${teacherId}`, payload);
  return data;
}

export async function updateSchedule(
  id: string,
  payload: {
    class_id: string;
    section_id?: string | null;
    subject_id: string;
    day_of_week: DayOfWeek;
    period_number: number;
    start_time: string;
    end_time: string;
  },
): Promise<ScheduleEntry> {
  const { data } = await api.put(`/schedules/${id}`, payload);
  return data;
}

export async function deleteSchedule(id: string): Promise<void> {
  await api.delete(`/schedules/${id}`);
}
