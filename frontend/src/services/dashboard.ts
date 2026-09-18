import { api } from "../lib/api";
import type { DashboardStats } from "../types";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get("/dashboard/stats");
  return data;
}

export interface WeeklyAttendance {
  day: string;
  present: number;
  total: number;
  percentage: number;
}

export async function fetchWeeklyAttendance(): Promise<WeeklyAttendance[]> {
  const { data } = await api.get("/dashboard/weekly-attendance");
  return data;
}
