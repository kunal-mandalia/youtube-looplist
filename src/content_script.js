(async () => {
  const src = chrome.extension.getURL("content_main.js")
  const content = await import(src)
  content.main()
})()