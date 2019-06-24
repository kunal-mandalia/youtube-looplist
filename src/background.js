import { logger } from './util/logger.js'

logger.info(`background.js is running`)

function enableExtension(conditions = {}) {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: conditions.hostEquals},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }])
      logger.info(`added rule to whitelist host`)
    })
  })
}

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.info(`background.js received message`, message, sender)
  
    if (!message || !message.type) {
      logger.error(`unahndled message type`, message)
    }
  
    if (message.type === 'START_LOOP') {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        logger.info(`tabs`, tabs)
        chrome.tabs.sendMessage(tabs[0].id, { type: "PLAY_VIDEO", payload: { startTime: "01:20" } }, (response) => {
          logger.info(`response from content to ping`, response)
        })
      })
      return sendResponse({ status: "OK" })
    }
  })
}

function main() {
  enableExtension({ hostEquals: 'localhost' })
  setupMessageListener()
}

main()

export default {}