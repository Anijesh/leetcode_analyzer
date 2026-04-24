import hashlib
import json
from django.core.cache import cache
from django.conf import settings
from openai import OpenAI

client = OpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

CACHE_TTL = 60 * 60  # 1 hour


def build_prompt(problem_name, language, code, problem_description=''):
    desc_section = f"\nProblem statement: {problem_description}\n" if problem_description else ""
    return f"""You are a senior most competitive programmer and code reviewer who already solved all leetcode problems.
Analyze this {language} solution for the LeetCode problem "{problem_name}".
{desc_section}
Solution code:
```{language}
{code}
```

Reply ONLY with valid JSON — no markdown, no backticks, no explanation outside the JSON.
Use exactly this schema:
{{
  "approach_current": "short label e.g. Array / Hash Map",
  "approach_suggested": "short label e.g. Two Pointers",
  "approach_keyidea": "one sentence describing the core insight",
  "alternatives": "2-3 sentences on alternative approaches and tradeoffs",
  "time_complexity": "O(n)",
  "time_desc": "one line explanation of why",
  "space_complexity": "O(1)",
  "space_desc": "one line explanation of why",
  "readability": "Excellent or Good or Average or Fair or Poor",
  "structure": "Excellent or Good or Average or Fair or Poor",
  "style_suggestions": "2-3 specific style improvement tips",
  "improvements": "3-5 concrete improvement suggestions as a short paragraph",
  "verdict": "2-3 sentence overall summary with encouragement",
  "accepted_sub": "short tagline e.g. All test cases pass · O(n) time · O(1) space"
}}"""


def make_cache_key(problem_name, language, code):
    raw = f"{problem_name}:{language}:{code}"
    return "analysis:" + hashlib.sha256(raw.encode()).hexdigest()


def get_analysis(problem_name, language, code, problem_description=''):
    cache_key = make_cache_key(problem_name, language, code)

    cached = cache.get(cache_key)
    if cached:
        return cached, True

    prompt = build_prompt(problem_name, language, code, problem_description)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a senior competitive programmer. Always respond with valid JSON only. No markdown, no explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
    )

    raw_text = response.choices[0].message.content.strip()
    cleaned = raw_text.replace('```json', '').replace('```', '').strip()
    result = json.loads(cleaned)

    cache.set(cache_key, result, CACHE_TTL)

    return result, False