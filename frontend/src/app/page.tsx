import Link from "next/link";
import { Activity, Brain, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 text-sm text-orange-400 font-medium">
          <Zap className="w-3.5 h-3.5" />
          Powered by Google Gemini + Strava
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="text-white">GenFit</span>
          <span className="text-orange-500"> AI</span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Connect your Strava. Let AI analyze your training data and generate a
          personalized weekly fitness plan built around your goals.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/register"
            className="px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-base transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-base transition-colors border border-neutral-700"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 text-left">
          {[
            {
              icon: Activity,
              title: "Sync from Strava",
              body: "Automatically import your runs, rides, and workouts.",
            },
            {
              icon: Brain,
              title: "AI Analysis",
              body: "Gemini reviews your activity history and fitness goals.",
            },
            {
              icon: Zap,
              title: "7-Day Plan",
              body: "Get a structured, personalized weekly training schedule.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-neutral-400">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
