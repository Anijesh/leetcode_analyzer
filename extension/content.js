
function getFullCode() {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      window.removeEventListener('LEETCODE_ANALYZER_RETURN_CODE', handler)
      try {
        const allLines = document.querySelectorAll('.view-line')
        if (allLines.length > 0) {
          resolve(Array.from(allLines).map(line => line.innerText).join('\n').trim())
          return
        }
      } catch (e) {}
      resolve('')
    }, 3000)

    const handler = (e) => {
      clearTimeout(timeout)
      window.removeEventListener('LEETCODE_ANALYZER_RETURN_CODE', handler)

      let code = e.detail || ''

      if (!code.trim()) {
        try {
          const allLines = document.querySelectorAll('.view-line')
          if (allLines.length > 0) {
            code = Array.from(allLines).map(line => line.innerText).join('\n').trim()
          }
        } catch (err) {}
      }

      resolve(code.trim())
    }

    
    window.addEventListener('LEETCODE_ANALYZER_RETURN_CODE', handler)
    window.dispatchEvent(new Event('LEETCODE_ANALYZER_GET_CODE'))
  })
}

async function extractProblemData() {
  const titleEl = document.querySelector('[class*="title"]')
  const rawTitle = titleEl?.innerText?.trim() || document.title.replace(' - LeetCode', '').trim()
  const title = rawTitle.replace(/^\d+\.\s*/, '').trim()

  
  const difficultyEl = document.querySelector('[class*="difficulty"]')
  const difficulty = difficultyEl?.innerText?.trim() || ''

  
  const descEl = document.querySelector('[data-track-load="description_content"]')
  const description = descEl?.innerText?.trim() || ''

  
  const topicEls = document.querySelectorAll('[class*="topic-tag"]')
  const topics = Array.from(topicEls).map(el => el.innerText.trim()).filter(Boolean)

  const code = await getFullCode()
  const langEl = document.querySelector('[class*="language"] button')
  const language = langEl?.innerText?.trim() || ''

  return {
    title,
    difficulty,
    description,
    topics,
    code,
    language,
    url: window.location.href
  }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PROBLEM_DATA') {
    extractProblemData().then(data => {
      sendResponse({ success: true, data })
    }).catch(err => {
      sendResponse({ success: false, error: err.message })
    })
  }
  
  return true
})

chrome.runtime.sendMessage({ type: 'ON_LEETCODE_PROBLEM' })