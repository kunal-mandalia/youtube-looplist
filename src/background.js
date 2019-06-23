import { logger } from './util/logger.js'

logger.info(`background.js is running`)

function getSenderId(sender) {
  if (sender.tab) {
    return sender.tab.id
  }
  return sender.id
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  logger.info(`background.js received message`, message, sender)

  if (!message || !message.type) {
    logger.error(`unahndled message type`, message)
  }

  if (message.type === 'PING') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      logger.info(`tabs`, tabs)
      chrome.tabs.sendMessage(tabs[0].id, { type: "PING_CONTENT" }, (response) => {
        logger.info(`response from content to ping`, response)
      })
    })
    return sendResponse({ type: 'PING', data: 'pong' })
  }
})