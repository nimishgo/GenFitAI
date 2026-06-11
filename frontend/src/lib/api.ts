import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
            refresh,
          });
          localStorage.setItem("access_token", data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    age?: number;
    fitness_goal?: string;
  }) => api.post("/api/auth/register/", data),

  login: (email: string, password: string) =>
    api.post("/api/auth/login/", { email, password }),

  me: () => api.get("/api/auth/me/"),

  updateProfile: (data: { fitness_goal?: string; age?: number }) =>
    api.patch<User>("/api/auth/me/", data),
};

export const stravaApi = {
  getConnectUrl: () => api.get<{ auth_url: string }>("/api/strava/connect/"),
  sync: () => api.post("/api/strava/sync/"),
  activities: () => api.get<Activity[]>("/api/strava/activities/"),
};

export const plansApi = {
  generate: () => api.post<FitnessPlan>("/api/plans/generate/"),
  list: () => api.get<FitnessPlan[]>("/api/plans/"),
};

export interface Activity {
  id: number;
  strava_id: number;
  name: string;
  sport_type: string;
  distance: number;
  elapsed_time: number;
  start_date: string;
  average_heartrate: number | null;
  total_elevation_gain: number;
}

export interface WorkoutDay {
  day: string;
  workout: string;
  description: string;
  duration_minutes: number;
  intensity: "easy" | "moderate" | "hard" | "rest";
}

export interface PlanContent {
  summary: string;
  weekly_plan: WorkoutDay[];
  tips: string[];
}

export interface FitnessPlan {
  id: number;
  content: PlanContent;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  age: number | null;
  fitness_goal: string;
  strava_connected: boolean;
}
