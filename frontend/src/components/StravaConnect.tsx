"use client";

import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { stravaApi } from "@/lib/api";

export default function StravaConnect() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await stravaApi.getConnectUrl();
      window.location.href = data.auth_url;
    } catch {
      setError("Failed to get Strava authorization URL. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-900/50 p-8 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
        <Activity className="w-7 h-7 text-orange-400" />
      </div>

      <div className="space-y-1.5">
        <h3 className="font-semibold text-white text-lg">Connect Strava</h3>
        <p className="text-sm text-neutral-400 max-w-xs mx-auto">
          Link your Strava account to sync activities and unlock AI-powered
          fitness plans.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FC4C02] hover:bg-[#e84400] disabled:opacity-50 text-white font-semibold text-sm transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Activity className="w-4 h-4" />
        )}
        Connect with Strava
      </button>
    </div>
  );
}
