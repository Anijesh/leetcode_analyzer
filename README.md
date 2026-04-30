# LeetCode Analyzer

LeetCode's built-in AI code analysis is a great feature, but the free tier only gives you **one analysis per day**. If you're actively grinding problems or prepping for interviews, that limit is a huge bottleneck.

I built this extension to bypass that restriction. It hooks straight into your LeetCode problem page and uses Groq's incredibly fast API (running Llama 3) to analyze your code. Since you plug in your own free Groq API key, you get virtually unlimited, lightning-fast code reviews without needing a premium LeetCode subscription.

## What it actually does

Unlike generic AI wrappers that just say "looks good," this analyzer is prompted to be a strict senior engineer.

- **Validates Correctness:** It checks if your code actually solves the *specific* problem you're on based on constraints and examples. (If you submit a generic array traversal for a graph problem, it will catch it and mark it wrong).
- **Complexity Breakdown:** Calculates your Big-O Time and Space complexity and explains *why*.
- **Approach Suggestions:** Identifies the pattern you used (e.g., "Brute Force") and tells you the optimal pattern you should be using instead (e.g., "Sliding Window" or "Two Pointers").
- **Code Style:** Rates your structure and readability out of 5 stars and gives you concrete tips to write cleaner, more professional code.
- **Native Side Panel UI:** It lives entirely in the Chrome side panel, so you can read the analysis side-by-side with your code without switching tabs.

## Tech Stack

The project is split into a frontend extension and a backend API:

1. **Frontend (Chrome Extension):** Built with Vanilla JS, CSS, and Manifest V3. It communicates with the LeetCode DOM to grab the problem description and your code, then passes it to the backend.
2. **Backend (Django REST Framework):** A Python API that formats the prompt and talks to the Groq API. 
   - **Smart Caching:** I set up Redis caching that hashes your problem name, language, and code. If you hit "Analyze" twice on the exact same code, it instantly returns the cached result without making another API call.

## How to run it locally

### 1. Set up the Backend
Make sure you have Python and Redis installed on your machine.

```bash
# Clone the repo and go into the backend folder
cd backend

# Set up a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt
```

Make sure your local Redis server is running. Then, start the Django development server:

```bash
python manage.py runserver
```
The backend will now be listening on `http://127.0.0.1:8000`.

### 2. Install the Chrome Extension
1. Open Chrome and go to `chrome://extensions/`.
2. Toggle **Developer mode** on in the top right corner.
3. Click the **Load unpacked** button.
4. Select the `extension` folder from this repository.
5. (Optional) Pin the extension to your browser toolbar for easy access.

### 3. Get analyzing
1. Create a free account on Groq and generate an API key at [console.groq.com](https://console.groq.com/keys).
2. Go to any LeetCode problem page.
3. Click the LeetCode Analyzer extension icon to open the side panel.
4. Paste your Groq API key when the extension asks for it.
5. Paste your solution in the box (or hit "Fetch Code") and click **Analyze**!


