import { api } from "../lib/api";

export interface Exam {
  id: string;
  name: string;
  exam_type: string;
  class_id: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface StudentMark {
  student_id: string;
  subject_id: string;
  marks: number;
}

export interface ExamResult {
  subject: string;
  marks: number;
  grade: string;
  gpa: number;
}

export interface StudentResultResponse {
  rows: ExamResult[];
  total: number;
  average: number;
  gpa: number;
  result: string;
  total_label: string;
}

export async function listExams(): Promise<Exam[]> {
  const { data } = await api.get("/exams");
  return data;
}

export async function createExam(exam: {
  name: string;
  exam_type: string;
  class_id?: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}): Promise<{ id: string; name: string }> {
  const { data } = await api.post("/exams", exam);
  return data;
}

export async function enterMarks(examId: string, entries: StudentMark[]): Promise<{ ok: boolean; count: number }> {
  const { data } = await api.post(`/exams/${examId}/marks`, { exam_id: examId, entries });
  return data;
}

export async function getStudentResult(studentId: string, examId: string): Promise<StudentResultResponse> {
  const { data } = await api.get(`/results/student/${studentId}/exam/${examId}`);
  return data;
}

export async function getReportCard(studentId: string, examId: string) {
  const { data } = await api.get(`/reports/report-card/${studentId}/exam/${examId}`);
  return data;
}
