"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, User, Target, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { setTokens } from "@/lib/auth";
import { FITNESS_GOALS } from "@/lib/goals";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    age: "",
    fitness_goal: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authApi.register({
        email: form.email,
        username: form.username || form.email,
        password: form.password,
        age: form.age ? Number(form.age) : undefined,
        fitness_goal: form.fitness_goal,
      });
      setTokens(data.access, data.refresh);
      document.cookie = `access_token=${data.access}; path=/; max-age=3600; SameSite=Strict`;
      router.push("/dashboard");
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: Record<string, string[]> } })
        ?.response?.data;
      const msg = errData
        ? Object.values(errData).flat().join(" ")
        : "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-2xl font-bold">
          <Zap className="w-6 h-6 text-orange-500" />
          <span>
            GenFit<span className="text-orange-500"> AI</span>
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-white">Create your account</h1>
        <p className="text-neutral-400 text-sm">
          Start your personalized fitness journey
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={form.username}
                onChange={set("username")}
                placeholder="Optional — defaults to email"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={set("password")}
                placeholder="Min. 8 characters"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">
              Age <span className="text-neutral-500">(optional)</span>
            </label>
            <input
              type="number"
              min={10}
              max={100}
              value={form.age}
              onChange={set("age")}
              placeholder="e.g. 28"
              className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">
              Fitness Goal
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
              <select
                value={form.fitness_goal}
                onChange={set("fitness_goal")}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition appearance-none"
              >
                <option value="">Select goal</option>
                {FITNESS_GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2 mt-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Account
        </button>
      </form>

      <p className="text-center text-sm text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-orange-400 hover:text-orange-300 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
