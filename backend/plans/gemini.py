import json
import re
import time
from django.conf import settings
from google import genai
from google.genai.errors import ServerError


def generate_fitness_plan(user, activities: list[dict], max_retries: int = 3) -> dict:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

    activity_summary = "\n".join(
        f"- {a['name']} ({a['sport_type']}): {a['distance'] / 1000:.1f} km, "
        f"{a['elapsed_time'] // 60} min"
        + (
            f", avg HR {a['average_heartrate']} bpm"
            if a.get("average_heartrate")
            else ""
        )
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

    last_error = None
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            break
        except ServerError as e:
            last_error = e
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
                continue
            raise last_error

    raw = (response.text or "").strip()

    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not json_match:
        raise ValueError(f"Model did not return valid JSON. Raw response: {raw[:500]}")

    try:
        return json.loads(json_match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"Malformed JSON from model: {e}") from e
