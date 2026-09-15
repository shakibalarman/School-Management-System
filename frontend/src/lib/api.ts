import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sms_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      const refresh = localStorage.getItem("sms_refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem("sms_access_token", data.access_token);
          localStorage.setItem("sms_refresh_token", data.refresh_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return api(original);
        } catch {
          localStorage.removeItem("sms_access_token");
          localStorage.removeItem("sms_refresh_token");
        }
      }
    }
    return Promise.reject(error);
  },
);
