import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { School, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";

const schema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type Form = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Form) {
    setError(null);
    try {
      await login(values.email, values.password);
      const { data: me } = await api.get("/auth/me");
      if (me.role === "student") {
        nav("/student", { replace: true });
      } else {
        nav("/", { replace: true });
      }
    } catch {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <School size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">SchoolMentor</h1>
          <p className="text-lg text-white/80">
            A comprehensive school management system for administrators, teachers, and students.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <School size={22} className="text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">SchoolMentor</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back</h2>
          <p className="text-sm text-slate-500 mb-8">Sign in to your admin dashboard</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                {...register("email")}
                type="email"
                placeholder="admin@school.com"
                className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              {formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formState.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formState.errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
            >
              {formState.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-500 text-center">
              Demo: <span className="font-medium text-slate-700">admin@school.com</span> / <span className="font-medium text-slate-700">Admin123!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
