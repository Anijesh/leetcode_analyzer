import hashlib
import json
from django.core.cache import cache
from django.conf import settings
from openai import OpenAI


CACHE_TTL = 60 * 60


def build_prompt(problem_name, language, code, problem_description=''):
    desc_section = f"\nProblem statement (includes examples and constraints):\n{problem_description}\n" if problem_description else ""
    return f"""You are a senior most competitive programmer and code reviewer who already solved all leetcode problems.

Your job is to analyze if the given code actually solves the specific problem "{problem_name}".
Be very strict — if the code is a solution to a DIFFERENT problem (even a similar one), mark it as wrong.
For example, if someone submits a Two Sum solution for House Robber V, that is WRONG even if the code runs.

STATUS RULES — follow these exactly, no exceptions:
- "accepted" → code correctly solves the problem based on the given examples and constraints
- "wrong" → code fails any of the given examples OR is clearly a solution to a completely different problem

{desc_section}
The code being analyzed:
```{language}
{code}
```

Step 1: Check if this code solves "{problem_name}" or a different problem entirely.
Step 2: Trace through the examples given in the problem statement manually with this code.
Step 3: Based on your trace, assign the correct status.

Reply ONLY with valid JSON — no markdown, no backticks, no explanation outside the JSON.
Use exactly this schema:
{{
  "status": "accepted or wrong",
  "status_reason": "one sentence explaining why — be specific e.g. 'code fails on input ()[]{{}} because curly braces are not handled' or 'code solves Two Sum not House Robber V'",
  "approach_current": "short label e.g. Array / Hash Map",
  "approach_suggested": "short label e.g. Two Pointers / Dynamic Programming",
  "approach_keyidea": "one sentence describing the core insight needed for this specific problem",
  "alternatives": "2-3 sentences on alternative approaches and tradeoffs",
  "time_complexity": "O(n)",
  "time_desc": "one line explanation of why",
  "space_complexity": "O(1)",
  "space_desc": "one line explanation of why",
  "readability": "Excellent or Good or Average or Fair or Poor",
  "structure": "Excellent or Good or Average or Fair or Poor",
  "style_suggestions": "2-3 specific style improvement tips",
  "improvements": "3-5 concrete improvement suggestions as a short paragraph",
  "verdict": "2-3 sentence overall summary — if wrong mention what problem this code actually solves",
  "accepted_sub": "short tagline showing complexity only e.g. O(n) time · O(1) space — never say all test cases pass"
}}"""


def make_cache_key(problem_name, language, code):
    # same problem + same language + same code = same analysis
    # hash all three so the key is always unique and consistent
    raw = f"{problem_name}:{language}:{code}"
    return "analysis:" + hashlib.sha256(raw.encode()).hexdigest()


def get_analysis(problem_name, language, code, problem_description='', api_key=None):
    if not code.strip():
        raise ValueError("code can't be empty")
    if not problem_name.strip():
        raise ValueError("problem name can't be empty")
    if len(code) > 10000:
        raise ValueError("code is too long, max 10000 chars")

   
    key = api_key if api_key else settings.GROQ_API_KEY
    if not key:
        raise ValueError("no groq api key found — either pass one or set GROQ_API_KEY in .env")

    client = OpenAI(
        api_key=key,
        base_url="https://api.groq.com/openai/v1"
    )

    cache_key = make_cache_key(problem_name, language, code)

    try:
        cached = cache.get(cache_key)
        if cached:
            return cached, True
    except Exception:
        pass

    prompt = build_prompt(problem_name, language, code, problem_description)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": "You are a senior competitive programmer. You are very strict about whether code solves the exact problem given. Always trace through examples manually before deciding status. Always respond with valid JSON only. No markdown, no explanation."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
    )

    raw_text = response.choices[0].message.content.strip()


    cleaned = raw_text.replace('```json', '').replace('```', '').strip()
    result = json.loads(cleaned)

    try:
        cache.set(cache_key, result, CACHE_TTL)
    except Exception:
        pass

    return result, False