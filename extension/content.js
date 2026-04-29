
function extractProblemData() {

  const titleEl = document.querySelector('[class*="title"]')
  const rawTitle = titleEl?.innerText?.trim() || document.title.replace(' - LeetCode', '').trim()
  const title = rawTitle.replace(/^\d+\.\s*/, '').trim()

  
  const difficultyEl = document.querySelector('[class*="difficulty"]')
  const difficulty = difficultyEl?.innerText?.trim() || ''

  
  const descEl = document.querySelector('[data-track-load="description_content"]')
  const description = descEl?.innerText?.trim() || ''

  
  const topicEls = document.querySelectorAll('[class*="topic-tag"]')
  const topics = Array.from(topicEls).map(el => el.innerText.trim()).filter(Boolean)

  
  const codeLines = document.querySelectorAll('.view-line')
  const code = Array.from(codeLines).map(line => line.innerText).join('\n').trim()

  
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
    const data = extractProblemData()
    sendResponse({ success: true, data })
  }
  
  return true
})

chrome.runtime.sendMessage({ type: 'ON_LEETCODE_PROBLEM' })