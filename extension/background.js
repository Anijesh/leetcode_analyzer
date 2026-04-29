
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id })
})


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.url) return

  if (changeInfo.status === 'complete' && tab.url.includes('leetcode.com/problems/')) {
    chrome.sidePanel.setOptions({
      tabId,
      path: 'sidebar.html',
      enabled: true
    })
  } else if (changeInfo.status === 'complete') {
    chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    })
  }
})