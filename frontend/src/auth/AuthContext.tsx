import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "../lib/api";

export type Role = "admin" | "teacher" | "student" | "guardian";

interface SessionUser {
  id: string;
  email: string;
  role: Role;
}

interface AuthCtx {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sms_access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => {
        localStorage.removeItem("sms_access_token");
        localStorage.removeItem("sms_refresh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("sms_access_token", data.access_token);
    localStorage.setItem("sms_refresh_token", data.refresh_token);
    const me = await api.get("/auth/me");
    setUser(me.data);
  }

  function logout() {
    localStorage.removeItem("sms_access_token");
    localStorage.removeItem("sms_refresh_token");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
