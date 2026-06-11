import json
import re
from django.conf import settings
from google import genai
from google.genai import types


def generate_fitness_plan(user, activities: list[dict]) -> dict:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    activity_summary = "\n".join(
        f"- {a['name']} ({a['sport_type']}): {a['distance'] / 1000:.1f} km, "
        f"{a['elapsed_time'] // 60} min"
        + (f", avg HR {a['average_heartrate']} bpm" if a.get("average_heartrate") else "")
        for a in activities[:10]
    )

    age_str = f"{user.age} years old" if user.age else "age not specified"
    goal_str = user.fitness_goal if user.fitness_goal else "general fitness"

    prompt = f"""You are an expert personal trainer and sports coach.
Based on the athlete profile and recent activity data below, create a personalized 7-day training plan.

ATHLETE PROFILE:
- Age: {age_str}
- Goal: {goal_str}

RECENT ACTIVITIES (last {len(activities[:10])}):
{activity_summary if activities else "No recent activities — design a beginner-friendly plan."}

Return ONLY a valid JSON object with this exact structure:
{{
  "summary": "2-3 sentence overview of the plan rationale",
  "weekly_plan": [
    {{
      "day": "Monday",
      "workout": "Workout title",
      "description": "Detailed instructions",
      "duration_minutes": 45,
      "intensity": "easy|moderate|hard|rest"
    }}
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )
    raw = response.text.strip()

    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())

    return {"summary": raw, "weekly_plan": [], "tips": []}
