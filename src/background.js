import { logger } from './util/logger.js'

logger.info(`background.js is running`, chrome)

let lastActiveTabId = null

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
      lastActiveTabId = message.payload.tabId
      const periodInMinutes = 0.1
      chrome.alarms.create('PLAY_VIDEO', { when: Date.now(), periodInMinutes })
      return sendResponse({ status: "OK" })
    }
  })
}

function setupAlarmListeners() {
  logger.info(`chrome`, chrome)
  chrome.alarms.onAlarm.addListener((alarmInfo = {}) => {
    logger.info(`alarm went off ${JSON.stringify(alarmInfo)}`)
    const { name } = alarmInfo

    if (name === 'PLAY_VIDEO') {
      // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      //   logger.info(`tabs`, tabs)
      //   const tabId = tabs && tabs[0].id || videoLoopTabId
      //   chrome.tabs.sendMessage(tabId, { type: "PLAY_VIDEO", payload: { startTime: "01:10" } }, (response) => {
      //     logger.info(`response from content to PLAY_VIDEO`, response)
      //   })
      // })
      chrome.tabs.sendMessage(lastActiveTabId, {
        type: "PLAY_VIDEO",
        payload: { startTime: "01:10" }
      }, (response) => {
        logger.info(`response from content to PLAY_VIDEO`, response)
      })
    }
  })
}

function main() {
  enableExtension({ hostEquals: 'www.youtube.com' })
  setupMessageListener(),
  setupAlarmListeners()
}

main()

export default {}