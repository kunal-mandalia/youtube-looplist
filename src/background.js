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
      const periodInMinutes = 1
      chrome.alarms.create('PLAY_VIDEO', { periodInMinutes })
      return sendResponse({ status: "OK" })
    }
  })
}

function setupAlarmListeners() {
  chrome.alarms.onAlarm.addListener((alarmInfo = {}) => {
    logger.info(`alarm went off ${JSON.stringify(alarmInfo)}`)
    const { name } = alarmInfo

    if (name === 'PLAY_VIDEO') {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        logger.info(`tabs`, tabs)
        chrome.tabs.sendMessage(tabs[0].id, { type: "PLAY_VIDEO", payload: { startTime: "01:10" } }, (response) => {
          logger.info(`response from content to PLAY_VIDEO`, response)
        })
      })
    }
  })
}

function main() {
  enableExtension({ hostEquals: 'localhost' })
  setupMessageListener(),
  setupAlarmListeners()
}

main()

export default {}