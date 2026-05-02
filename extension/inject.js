
window.addEventListener('LEETCODE_ANALYZER_GET_CODE', () => {
  let code = ''

  try {
    if (typeof monaco !== 'undefined') {
      const models = monaco.editor.getModels()
      if (models && models.length > 0) {
        const biggest = models.reduce((a, b) =>
          a.getValue().length > b.getValue().length ? a : b
        )
        const value = biggest.getValue()
        if (value.trim()) code = value
      }
    }
  } catch (e) {}

  window.dispatchEvent(new CustomEvent('LEETCODE_ANALYZER_RETURN_CODE', { detail: code }))
})