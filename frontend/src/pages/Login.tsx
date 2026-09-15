import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../auth/AuthContext";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    setError(null);
    try {
      await login(values.email, values.password);
      nav("/", { replace: true });
    } catch {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow p-8 w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">SMS Login</h1>
        <div>
          <label className="text-sm">Email</label>
          <input {...register("email")} className="mt-1 w-full border rounded px-3 py-2" />
          {formState.errors.email && <p className="text-red-600 text-sm">{formState.errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm">Password</label>
          <input type="password" {...register("password")} className="mt-1 w-full border rounded px-3 py-2" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full bg-blue-600 text-white rounded py-2" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-slate-500">Seeded admin: admin@school.com / Admin123!</p>
      </form>
    </div>
  );
}
