(async () => {
  const src = chrome.extension.getURL("content_main.js")
  const contentMain = await import(src)
  contentMain.main()
})()