import { logger } from './util/logger.js'

logger.info(`background.js is running`)

const _alarms = {}

function convertToSeconds(timeString) {
  const [m, s] = timeString.split(":")
  return (parseInt(m, 10) * 60) + (parseInt(s, 10))
}

function getPeriodInMinutes(startTime, endTime) {
  const start = convertToSeconds(startTime)
  const end = convertToSeconds(endTime)
  return (end - start) / 60
}

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
      const { startTime, endTime } = message.payload
      const periodInMinutes = getPeriodInMinutes(startTime, endTime)
      logger.info(`periodInMinutes`, periodInMinutes)

      const alarmName = 'PLAY_VIDEO'
      const alarm = { when: Date.now(), periodInMinutes }
      chrome.alarms.create(alarmName, alarm)

      // replace _alarms with storage
      _alarms[alarmName] = { name: alarmName, ...alarm, ...message.payload }

      chrome.storage.sync.set({ [alarmName]: { name: alarmName, ...alarm, ...message.payload } })
      logger.info(`_alarms`, _alarms)
      return sendResponse({ status: "OK" })
    }
  })
}

function setupAlarmListeners() {
  chrome.alarms.onAlarm.addListener((alarmInfo = {}) => {
    logger.info(`alarm went off ${JSON.stringify(alarmInfo)}`)
    const { name } = alarmInfo


    if (name === 'PLAY_VIDEO') {
      const alarm = _alarms[name]
      chrome.tabs.sendMessage(alarm.tabId, {
        type: "PLAY_VIDEO",
        payload: { startTime: alarm.startTime }
      }, (response) => {
        logger.info(`response from content to PLAY_VIDEO`, response)
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