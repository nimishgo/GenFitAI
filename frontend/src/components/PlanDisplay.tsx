import { FitnessPlan, WorkoutDay } from "@/lib/api";
import { CheckCircle, Flame, Info, Zap } from "lucide-react";

const INTENSITY_STYLES: Record<string, string> = {
  easy: "bg-green-500/10 text-green-400 border-green-500/20",
  moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-400 border-red-500/20",
  rest: "bg-neutral-800 text-neutral-400 border-neutral-700",
};

function WorkoutCard({ day }: { day: WorkoutDay }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          {day.day}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${
            INTENSITY_STYLES[day.intensity] ?? INTENSITY_STYLES.easy
          }`}
        >
          {day.intensity}
        </span>
      </div>
      <p className="font-semibold text-white text-sm">{day.workout}</p>
      <p className="text-xs text-neutral-400 leading-relaxed">{day.description}</p>
      {day.duration_minutes > 0 && (
        <p className="text-xs text-neutral-500 flex items-center gap-1">
          <Flame className="w-3 h-3" />
          {day.duration_minutes} min
        </p>
      )}
    </div>
  );
}

export default function PlanDisplay({ plan }: { plan: FitnessPlan }) {
  const { summary, weekly_plan, tips } = plan.content;
  const generated = new Date(plan.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-orange-300">Plan Summary</p>
            <p className="text-sm text-neutral-300 leading-relaxed">{summary}</p>
            <p className="text-xs text-neutral-500 pt-1">Generated {generated}</p>
          </div>
        </div>
      </div>

      {weekly_plan && weekly_plan.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-400" />
            7-Day Training Plan
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {weekly_plan.map((day) => (
              <WorkoutCard key={day.day} day={day} />
            ))}
          </div>
        </div>
      )}

      {tips && tips.length > 0 && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Coach Tips
          </h3>
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                <span className="w-5 h-5 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 text-xs text-neutral-500 mt-0.5">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
