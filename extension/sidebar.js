const BACKEND_URL = 'http://127.0.0.1:8000/api/analyze/'


let currentProblemData = null


function stars(rating) {
  const map = { Excellent: 5, Good: 4, Average: 3, Fair: 2, Poor: 1 }
  const n = map[rating] || 0
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

function set(id, value) {
  const el = document.getElementById(id)
  if (el) el.textContent = value || '—'
}

function showError(id, msg) {
  const box = document.getElementById(id)
  box.textContent = msg
  box.style.display = 'block'
}

function hideError(id) {
  const box = document.getElementById(id)
  box.style.display = 'none'
}

function setLoading(loading) {
  const btn = document.getElementById('analyze-btn')
  const txt = document.getElementById('btn-text')
  btn.disabled = loading
  txt.textContent = loading ? '⏳ Analyzing...' : '⚡ Analyze Solution'
}


function getStatus(result) {
  if (result.status) {
    const s = result.status.toLowerCase().trim()
    if (s === 'wrong') return 'wrong'
    if (s === 'partial') return 'partial'
    if (s === 'accepted') return 'accepted'
  }

  // fallback — read groq's own words from verdict and improvements
  const text = (result.verdict + ' ' + result.improvements + ' ' + (result.status_reason || '')).toLowerCase()

  if (
    text.includes('incorrect') ||
    text.includes('wrong') ||
    text.includes('incomplete') ||
    text.includes('does not correctly') ||
    text.includes('does not solve') ||
    text.includes('different problem') ||
    text.includes('will not pass') ||
    text.includes('fails')
  ) return 'wrong'

  if (
    text.includes('partial') ||
    text.includes('not optimal') ||
    text.includes('suboptimal')
  ) return 'partial'

  return 'accepted'
}

function updateStatusBar(status, acceptedSub) {
  const bar = document.querySelector('.accepted-bar')
  const dot = document.querySelector('.accepted-dot')
  const text = document.querySelector('.accepted-text')
  const sub = document.getElementById('accepted-sub')

  if (status === 'wrong') {
    bar.style.background = '#2e1a1a'
    bar.style.borderColor = '#ef474333'
    dot.style.background = '#ef4743'
    text.style.color = '#ef4743'
    text.textContent = 'Wrong Answer'
  } else if (status === 'partial') {
    bar.style.background = '#2e2a1a'
    bar.style.borderColor = '#ffa11633'
    dot.style.background = '#ffa116'
    text.style.color = '#ffa116'
    text.textContent = 'Partial Solution'
  } else {
    bar.style.background = '#1e2e1e'
    bar.style.borderColor = '#2cbb5d33'
    dot.style.background = '#2cbb5d'
    text.style.color = '#2cbb5d'
    text.textContent = 'Accepted'
  }

  sub.textContent = acceptedSub || ''
}



function loadApiKey() {
  chrome.storage.local.get('groq_api_key', (data) => {
    if (data.groq_api_key) {
      showMainApp()
    } else {
      showApiKeyScreen()
    }
  })
}

function showApiKeyScreen() {
  document.getElementById('apikey-screen').style.display = 'block'
  document.getElementById('main-app').style.display = 'none'
}

function showMainApp() {
  document.getElementById('apikey-screen').style.display = 'none'
  document.getElementById('main-app').style.display = 'block'
  fetchProblemData()
}

document.getElementById('apikey-save-btn').addEventListener('click', () => {
  const key = document.getElementById('apikey-input').value.trim()

  if (!key) {
    showError('apikey-error', 'Please enter your Groq API key')
    return
  }

  if (!key.startsWith('gsk_')) {
    showError('apikey-error', 'Invalid key — Groq keys start with gsk_')
    return
  }

  
  chrome.storage.local.set({ groq_api_key: key }, () => {
    hideError('apikey-error')
    showMainApp()
  })
})

document.getElementById('change-key-btn').addEventListener('click', () => {
  chrome.storage.local.remove('groq_api_key', () => {
    showApiKeyScreen()
  })
})


function fetchProblemData() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return

    
    if (!tabs[0].url?.includes('leetcode.com/problems/')) {
      document.getElementById('no-problem').style.display = 'flex'
      document.getElementById('problem-bar').style.display = 'none'
      return
    }

    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PROBLEM_DATA' }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        document.getElementById('no-problem').style.display = 'flex'
        return
      }

      const data = response.data
      currentProblemData = data

      
      document.getElementById('no-problem').style.display = 'none'

      
      const bar = document.getElementById('problem-bar')
      bar.style.display = 'block'
      set('problem-title', data.title)
      set('header-sub', data.title || 'Problem detected')

      
      const badge = document.getElementById('difficulty-badge')
      badge.textContent = data.difficulty
      badge.className = 'difficulty-badge'
      if (data.difficulty === 'Medium') badge.classList.add('medium')
      if (data.difficulty === 'Hard') badge.classList.add('hard')


      set('topics-text', data.topics.slice(0, 3).join(' · '))

      
      if (data.language) {
        const select = document.getElementById('language')
        const match = Array.from(select.options).find(
          o => o.value.toLowerCase() === data.language.toLowerCase()
        )
        if (match) select.value = match.value
      }
    })
  })
}



document.getElementById('fetch-code-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_PROBLEM_DATA' }, (response) => {
      if (response?.data?.code) {
        document.getElementById('code').value = response.data.code
      } else {
        showError('error-box', 'Could not fetch code — please paste it manually')
      }
    })
  })
})



document.getElementById('analyze-btn').addEventListener('click', async () => {
  hideError('error-box')

  const code = document.getElementById('code').value.trim()
  const language = document.getElementById('language').value

  if (!code) {
    showError('error-box', 'Please paste your solution code first')
    return
  }

  if (!currentProblemData?.title) {
    showError('error-box', 'Please open a LeetCode problem page first')
    return
  }

  
  chrome.storage.local.get('groq_api_key', async (data) => {
    const apiKey = data.groq_api_key

    if (!apiKey) {
      showApiKeyScreen()
      return
    }

    setLoading(true)
    document.getElementById('result-section').style.display = 'none'

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem_name: currentProblemData.title,
          language: language,
          code: code,
          problem_description: currentProblemData.description,
          api_key: apiKey
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.error || 'Something went wrong')
      }

      const result = responseData.result

      const status = getStatus(result)
      updateStatusBar(status, result.accepted_sub)

      set('time-complexity', result.time_complexity)
      set('time-desc', result.time_desc)
      set('space-complexity', result.space_complexity)
      set('space-desc', result.space_desc)
      set('approach-current', result.approach_current)
      set('approach-suggested', result.approach_suggested)
      set('approach-keyidea', result.approach_keyidea)
      set('alternatives', result.alternatives)
      set('readability', result.readability)
      document.getElementById('readability-stars').textContent = stars(result.readability)
      set('structure', result.structure)
      document.getElementById('structure-stars').textContent = stars(result.structure)
      set('style-suggestions', result.style_suggestions)
      set('improvements', result.improvements)
      set('verdict', result.status_reason
        ? `${result.status_reason}\n\n${result.verdict}`
        : result.verdict
      )

      document.getElementById('result-section').style.display = 'flex'

    } catch (err) {
      showError('error-box', 'Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  })
})



document.getElementById('analyze-again-btn').addEventListener('click', () => {
  
  document.getElementById('result-section').style.display = 'none'
  document.getElementById('code').value = ''
  hideError('error-box')
})

loadApiKey()