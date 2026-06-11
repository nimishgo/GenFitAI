"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  Brain,
  LogOut,
  RefreshCw,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { authApi, stravaApi, plansApi } from "@/lib/api";
import type { User, Activity as ActivityType, FitnessPlan } from "@/lib/api";
import { clearTokens } from "@/lib/auth";
import ActivityCard from "@/components/ActivityCard";
import StravaConnect from "@/components/StravaConnect";
import PlanDisplay from "@/components/PlanDisplay";

function StravaNotification({ onMessage }: { onMessage: (msg: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const connected = searchParams.get("strava_connected");
    const err = searchParams.get("strava_error");
    if (connected) onMessage("Strava connected successfully!");
    if (err) onMessage(`Strava error: ${err.replace(/_/g, " ")}`);
  }, [searchParams, onMessage]);
  return null;
}

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [plan, setPlan] = useState<FitnessPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [stravaMsg, setStravaMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"activities" | "plan">("activities");

  const loadData = useCallback(async () => {
    try {
      const { data: userData } = await authApi.me();
      setUser(userData);

      if (userData.strava_connected) {
        const [actRes, planRes] = await Promise.all([
          stravaApi.activities(),
          plansApi.list(),
        ]);
        setActivities(actRes.data);
        if (planRes.data.length > 0) {
          setPlan(planRes.data[0]);
          setActiveTab("plan");
        }
      }
    } catch {
      clearTokens();
      document.cookie = "access_token=; max-age=0; path=/";
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await stravaApi.sync();
      const { data } = await stravaApi.activities();
      setActivities(data);
    } finally {
      setSyncing(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    try {
      const { data } = await plansApi.generate();
      setPlan(data);
      setActiveTab("plan");
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    document.cookie = "access_token=; max-age=0; path=/";
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Navbar */}
      <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="w-5 h-5 text-orange-500" />
            GenFit<span className="text-orange-500">AI</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-neutral-400 hidden sm:block">
                {user.email}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Suspense fallback={null}>
          <StravaNotification onMessage={setStravaMsg} />
        </Suspense>

        {/* Welcome + stats bar */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            Welcome back
            {user?.username ? `, ${user.username.split("@")[0]}` : ""}!
          </h1>
          {user?.fitness_goal && (
            <p className="text-neutral-400 text-sm flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-orange-400" />
              Goal: {user.fitness_goal}
            </p>
          )}
        </div>

        {/* Strava notification */}
        {stravaMsg && (
          <div
            className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
              stravaMsg.includes("error")
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-green-500/10 text-green-400 border border-green-500/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {stravaMsg}
          </div>
        )}

        {!user?.strava_connected ? (
          <StravaConnect />
        ) : (
          <>
            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-sm font-medium text-neutral-200 transition-colors border border-neutral-700"
              >
                {syncing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sync Strava
              </button>

              <button
                onClick={handleGeneratePlan}
                disabled={generating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-sm font-semibold text-white transition-colors"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Generate My Plan
              </button>

              {generating && (
                <span className="text-xs text-neutral-500 italic">
                  Gemini is analyzing your activities…
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatCard
                label="Total Activities"
                value={activities.length}
                suffix=""
              />
              <StatCard
                label="Total Distance"
                value={(
                  activities.reduce((s, a) => s + a.distance, 0) / 1000
                ).toFixed(1)}
                suffix="km"
              />
              <StatCard
                label="Total Time"
                value={Math.round(
                  activities.reduce((s, a) => s + a.elapsed_time, 0) / 3600
                )}
                suffix="hrs"
                className="col-span-2 sm:col-span-1"
              />
            </div>

            {/* Tabs */}
            <div className="border-b border-neutral-800">
              <div className="flex gap-0">
                {(["activities", "plan"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize flex items-center gap-2 ${
                      activeTab === tab
                        ? "border-orange-500 text-white"
                        : "border-transparent text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {tab === "activities" ? (
                      <Activity className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {tab === "plan" ? "AI Plan" : "Activities"}
                    {tab === "activities" && activities.length > 0 && (
                      <span className="ml-1 text-xs bg-neutral-700 text-neutral-400 rounded-full px-2 py-0.5">
                        {activities.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div>
              {activeTab === "activities" && (
                <div>
                  {activities.length === 0 ? (
                    <EmptyState
                      icon={Activity}
                      title="No activities yet"
                      body="Sync your Strava account to import your workouts."
                    />
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {activities.map((a) => (
                        <ActivityCard key={a.id} activity={a} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "plan" && (
                <div>
                  {!plan ? (
                    <EmptyState
                      icon={Sparkles}
                      title="No plan generated yet"
                      body='Click "Generate My Plan" to get a personalized 7-day training schedule.'
                    />
                  ) : (
                    <PlanDisplay plan={plan} />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  className = "",
}: {
  label: string;
  value: number | string;
  suffix: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-900 p-4 ${className}`}
    >
      <p className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold text-white mt-1">
        {value}
        <span className="text-sm font-normal text-neutral-500 ml-1">
          {suffix}
        </span>
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto">
        <Icon className="w-6 h-6 text-neutral-600" />
      </div>
      <p className="font-medium text-neutral-400">{title}</p>
      <p className="text-sm text-neutral-600 max-w-xs mx-auto">{body}</p>
    </div>
  );
}
