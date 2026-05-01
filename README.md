# LeetCode Analyzer

LeetCode's built-in AI code analysis is a great feature, but the free 
tier only gives you one analysis per day. If you're actively grinding 
problems or prepping for interviews, that limit is a huge bottleneck.

I built this as an independent tool that gives you unlimited AI-powered 
code analysis using your own free Groq API key.

## What it actually does

Unlike generic AI wrappers that just say "looks good," this analyzer is 
prompted to be a strict senior engineer.

- **Validates Correctness:** Checks if your code actually solves the 
  specific problem you're on based on its constraints and examples. 
  If you submit a Two Sum solution for House Robber V, it will catch 
  it and mark it wrong.
- **Complexity Breakdown:** Calculates Big-O time and space complexity 
  and explains why.
- **Approach Suggestions:** Identifies the pattern you used and tells 
  you the optimal pattern you should be using instead.
- **Code Style:** Rates your structure and readability out of 5 stars 
  with concrete improvement tips.
- **Native Side Panel UI:** Lives entirely in the Chrome side panel so 
  you can read the analysis side-by-side with your code.

## How it works

When you open a LeetCode problem, the extension reads the full problem 
statement, examples, and constraints directly from the page DOM. This 
context is sent along with your code to the backend, which means the AI 
understands what the problem is actually asking — not just your code in 
isolation. This is what prevents hallucination.

## Tech Stack

1. **Chrome Extension** — Vanilla JS, CSS, Manifest V3. Reads the 
   LeetCode DOM and sends data to the backend.
2. **Backend (Django REST Framework)** — Python API that formats the 
   prompt and calls the Groq API.
3. **PostgreSQL** — stores every analysis with language, code, result 
   and timestamp.
4. **Redis** — caches results by hashing problem name + language + code. 
   Same code analyzed twice returns instantly without an API call.

## How to run locally

### 1. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
SECRET_KEY=any-random-string
DEBUG=True
DB_NAME=leetcode_analyzer
DB_USER=your_postgres_username
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
REDIS_URL=redis://localhost:6379/0
```

Create the database and run migrations:

```bash
psql postgres -c "CREATE DATABASE leetcode_analyzer;"
python manage.py migrate
python manage.py runserver
```

### 2. Chrome extension setup

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. Pin it to your toolbar

### 3. Start analyzing

1. Get a free Groq API key at [console.groq.com](https://console.groq.com/keys)
2. Open any LeetCode problem
3. Click the extension icon
4. Enter your Groq API key
5. Paste your solution or click **Fetch from editor**
6. Click **Analyze**

## Important note

This tool performs static analysis — it does not execute your code. 
"Accepted" means the AI believes your solution is logically correct 
based on the problem description and examples. Always verify by 
submitting on LeetCode.
