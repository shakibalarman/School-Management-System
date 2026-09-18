import { api } from "../lib/api";

export interface ResultRow {
  subject: string;
  marks: number;
  grade: string;
  gpa: number;
}

export interface StudentResult {
  student_id: string;
  student_name: string;
  student_code: string | null;
  class_id?: string | null;
  rows: ResultRow[];
  total: number;
  average: number;
  gpa: number;
  result: string;
}

export interface ClassResult {
  class_id: string;
  class_name: string;
  total_students: number;
  passed: number;
  failed: number;
  pass_rate: number;
  avg_gpa: number;
  avg_marks: number;
  topper: StudentResult | null;
  students: StudentResult[];
}

export interface OverallResult {
  exam: string;
  classes: ClassResult[];
  summary: {
    total_students: number;
    passed: number;
    failed: number;
    pass_rate: number;
    avg_gpa: number;
    avg_marks: number;
    toppers: StudentResult[];
  };
}

export async function getAllResults(examId: string, classId?: string): Promise<StudentResult[]> {
  const params: Record<string, string> = { exam_id: examId };
  if (classId) params.class_id = classId;
  const { data } = await api.get("/results/all", { params });
  return data;
}

export async function getOverallResults(examId: string): Promise<OverallResult> {
  const { data } = await api.get("/results/overall", { params: { exam_id: examId } });
  return data;
}

export async function getTeacherResults(examId: string): Promise<StudentResult[]> {
  const { data } = await api.get("/teacher/results", { params: { exam_id: examId } });
  return data;
}

export async function getStudentResult(studentId: string, examId: string) {
  const { data } = await api.get(`/results/student/${studentId}/exam/${examId}`);
  return data;
}
