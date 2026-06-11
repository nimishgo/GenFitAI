import { Activity } from "@/lib/api";
import { Bike, Footprints, Heart, Mountain, Timer, Waves } from "lucide-react";

const SPORT_ICONS: Record<string, React.ElementType> = {
  Run: Footprints,
  Ride: Bike,
  Swim: Waves,
  Hike: Mountain,
  Walk: Footprints,
};

const INTENSITY_COLORS: Record<string, string> = {
  Run: "text-orange-400 bg-orange-500/10",
  Ride: "text-blue-400 bg-blue-500/10",
  Swim: "text-cyan-400 bg-cyan-500/10",
  Hike: "text-green-400 bg-green-500/10",
  Walk: "text-emerald-400 bg-emerald-500/10",
};

function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function ActivityCard({ activity }: { activity: Activity }) {
  const Icon = SPORT_ICONS[activity.sport_type] ?? Footprints;
  const colorClass =
    INTENSITY_COLORS[activity.sport_type] ?? "text-purple-400 bg-purple-500/10";
  const date = new Date(activity.start_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 flex items-start gap-4 hover:border-neutral-700 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-white text-sm truncate">{activity.name}</p>
          <span className="text-xs text-neutral-500 flex-shrink-0">{date}</span>
        </div>
        <p className="text-xs text-neutral-500 mt-0.5">{activity.sport_type}</p>

        <div className="flex items-center gap-4 mt-2">
          {activity.distance > 0 && (
            <span className="text-xs text-neutral-300 flex items-center gap-1">
              <Mountain className="w-3 h-3 text-neutral-500" />
              {formatDistance(activity.distance)}
            </span>
          )}
          <span className="text-xs text-neutral-300 flex items-center gap-1">
            <Timer className="w-3 h-3 text-neutral-500" />
            {formatDuration(activity.elapsed_time)}
          </span>
          {activity.average_heartrate && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {Math.round(activity.average_heartrate)} bpm
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
