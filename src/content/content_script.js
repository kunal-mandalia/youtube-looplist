(async () => {
  const src = chrome.extension.getURL("content/content_main.js")
  const content = await import(src)
  content.main()
})()