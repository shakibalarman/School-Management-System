import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function Placeholder({ title }: { title: string }) {
  return <div className="p-8"><h2 className="text-xl font-bold">{title}</h2><p className="text-slate-600">Module wired to API, UI coming incrementally.</p></div>;
}

export function StudentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => (await api.get("/students?limit=50")).data,
  });
  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-xl font-bold mb-4">Students</h2>
      {isLoading && <p>Loading…</p>}
      {error && <p className="text-red-600">Could not load (is the API running?).</p>}
      <ul className="grid gap-2">
        {(data ?? []).map((s: { id: string; first_name: string; last_name: string; student_code: string }) => (
          <li key={s.id} className="bg-white border rounded p-3">
            {s.first_name} {s.last_name} · {s.student_code}
          </li>
        ))}
      </ul>
    </div>
  );
}
