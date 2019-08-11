import { logger } from '../util/logger.js'
import time from '../util/time.js'

logger.info(`background.js is running`)
let chrome = window.chrome

const initialState = {
  activeVideo: null,
  tabId: null,
  videos: [],
  errors: []
}

async function setInitialState({ videos }) {
  return new Promise(async (resolve) => {
    await stopVideo({})
    chrome.storage.sync.get(storage => {
      if (storage.initialised) {
        logger.error(`initial state already set, skipping`, initialState)
        return resolve(storage)
      }
      logger.info(`set initial state`, initialState, videos)
      chrome.storage.sync.set({
        ...initialState,
        videos,
        initialised: Date.now()
      }, resolve)
    })
  })
}

function enableExtension(conditions = {}) {
  logger.info(`enableExtension`)
  chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostContains: ''
            }
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }])
      logger.info(`added rule to whitelist host`)
    })
    return true
  })
}

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.info(`background.js received message`, message, sender)

    if (!message || !message.type) {
      logger.error(`unhandled message type`, message)
    }

    switch (message.type) {
      case 'ADD_VIDEO_REQUEST':
        const { video } = message.payload
        addVideo(video)
          .then(result => { sendResponse(result) })
        return true

      case 'REMOVE_VIDEO_REQUEST':
        removeVideo(message.payload.id)
          .then(result => { sendResponse(result) })
        return true

      case 'PLAY_VIDEO_REQUEST':
        playVideo({ ...message.payload })
          .then(result => { sendResponse(result) })
        return true

      case 'STOP_VIDEO_REQUEST':
        chrome.storage.sync.get(({ tabId, activeVideo }) => {
          if (!activeVideo) {
            logger.error(`Stop video requested but active video`)
            sendResponse({ status: 'ERROR' })
          }
          stopVideo({ tabId })
            .then(result => { sendResponse(result) })
        })
        return true

      case 'REMOVE_ERROR_REQUEST':
        const { id } = message.payload
        removeError(id)
          .then(result => { sendResponse(result) })
          .catch(result => { sendResponse(result) })
        return true

      case 'GET_STORAGE_REQUEST':
        getStorage()
          .then(result => { sendResponse(result) })
        return true

      default:
        break;
    }
  })
}

function setupAlarmListeners() {
  logger.info(`setupAlarmListeners`)
  chrome.alarms.onAlarm.addListener((alarmInfo = {}) => {
    logger.info(`alarm went off ${JSON.stringify(alarmInfo)}`)
    const { name } = alarmInfo

    if (name === 'PLAY_VIDEO') {
      chrome.storage.sync.get(storage => {
        const { tabId, activeVideo } = storage
        if (!activeVideo) logger.error(`cannot play video when activeVideo is not set`)

        const { startSeconds } = activeVideo
        logger.info(`sending message to tabId ${tabId}`)
        chrome.tabs.sendMessage(tabId, {
          type: 'PLAY_VIDEO',
          payload: { startSeconds }
        }, (response) => {
          logger.info(`response to play video`, response)
        })
      })
    }
    return true
  })
}

async function addVideo(video) {
  logger.info(`addVideo called`)
  return new Promise(resolve => {
    chrome.storage.sync.get(storage => {
      logger.info(`existing storage`, storage)
      const videos = [...storage.videos, { ...video, id: Date.now() }]
      chrome.storage.sync.set({ videos }, () => {
        return resolve({ status: "OK" })
      })
    })
  })
}

async function removeVideo(id) {
  return new Promise(resolve => {
    chrome.storage.sync.get(storage => {
      const videos = [...storage.videos].filter(video => video.id !== id)
      chrome.storage.sync.set({ videos }, () => {
        return resolve({ status: "OK" })
      })
    })
  })
}

async function getVideoById(id) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(['videos'], ({ videos = [] }) => {
      const video = videos.find(video => video.id === id)
      logger.info(`getVideoById`, videos, video)
      if (video) {
        return resolve(video)
      }
      return reject()
    })
  })
}

async function getTabId() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['tabId'], ({ tabId }) => {
      return resolve(tabId)
    })
  })
}

async function verifyTabExists(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, () => {
      if (chrome.runtime.lastError) {
        logger.error(`verify tab exists failed for ${tabId}`, chrome.runtime.lastError.message);
        // clear tabId and activeVideo from storage if tab no longer exists
        const partialUpdate = { activeVideo: null, tabId: null }
        chrome.storage.sync.set(partialUpdate, () => {
          const lastErrorStorage = chrome.runtime.lastError
          if (chrome.runtime.lastError) return reject(Error(`could not set partial state`))
          return reject(Error(`verify tab exists failed for ${tabId}. Reset activeVideo, tabId`))
        })
      } else {
        return resolve(tabId)
      }
    })
  })
}

async function removeError(id) {
  return new Promise(resolve => {
    chrome.storage.sync.get(storage => {
      const partialUpdate = storage.errors.filter(e => {
        if (e.id === id) return false
        return true
      })
      chrome.storage.sync.set({ errors: partialUpdate }, () => {
        return resolve(`removed error by id ${id}`)
      })
    })
  })
}

async function playVideo({ id, loop, tabId: newTabId }) {
  logger.info(`background.js playVideo`, id, loop, newTabId)
  const tabId = await getTabId() || newTabId
  logger.info(`tabId`, tabId)
  try {
    await verifyTabExists(tabId)
  } catch (e) {
    await appendError({ id: Date.now(), description: `Error playing video. Try again.`})
    return { status: "ERROR" }
  }
  const video = await getVideoById(id)
  logger.info(`video`, video)
  await stopVideo({ tabId })
  logger.info(`stopped existing video`)
  await redirectToVideo({
    tabId,
    url: video.url,
    startTime: video.startTime
  })
  logger.info(`redirected to video`)
  await waitUntilVideoReady({ tabId })
  logger.info(`video is ready`)
  await setActiveVideo({ video, tabId, loop })
  logger.info(`active video set`)
  await setAlarm({ video })
  logger.info(`alarm set`)
  return { status: "OK" }
}

async function redirectToVideo({ tabId, url, startTime }) {
  return new Promise(resolve => {
    const urlWithStartTime = `${url}&start=${time.convertToSeconds(startTime)}`
    chrome.tabs.update(tabId, { url: urlWithStartTime }, resolve)
  })
}

async function waitUntilVideoReady({
  tabId,
  maxTries = 10,
  delay = 1000
}) {
  return new Promise(async (resolve, reject) => {
    let waiting = true
    let tries = 0
    while (waiting) {
      tries += 1
      if (tries > maxTries) {
        waiting = false
        break
      }
      chrome.tabs.sendMessage(tabId, { type: "IS_VIDEO_AVAILABLE" }, (response = {}) => {
        logger.info(`is video available response`, response)
        if (!chrome.runtime.lastError && response.data === true) {
          waiting = false
          return resolve(response)
        }
      })
      await time.wait(delay)
    }
    return reject(Error(`video not found`))
  })
}

async function setActiveVideo({ video, tabId, loop }) {
  return new Promise(resolve => {
    const { id, startTime, stopTime } = video
    const activeVideo = {
      id,
      loop,
      startSeconds: time.convertToSeconds(startTime),
      stopSeconds: time.convertToSeconds(stopTime),
    }
    chrome.storage.sync.set({ tabId, activeVideo }, resolve)
  })
}

async function setAlarm({ video }) {
  return new Promise(resolve => {
    const { startTime, stopTime } = video
    logger.info(`set alarm at`, startTime, stopTime)
    const periodInMinutes = time.getPeriodInMinutes(startTime, stopTime)
    const alarm = { delayInMinutes: periodInMinutes, periodInMinutes }
    chrome.alarms.create('PLAY_VIDEO', alarm)
    return resolve()
  })
}

async function stopVideo({ tabId } = {}) {
  logger.info(`stopVideo...`)
  return new Promise(resolve => {
    logger.info(`clearing alarms...`)
    chrome.alarms.clearAll(() => {
      logger.info(`cleared all alarms`)
      chrome.storage.sync.set({ activeVideo: null }, () => {
        logger.info(`reset active video`)
        if (tabId) {
          chrome.tabs.sendMessage(tabId, { type: 'STOP_VIDEO' }, (response = {}) => {
            logger.info(`stop video response`, response)
            if (chrome.runtime.lastError) {
              logger.error(`runtime error: ${chrome.runtime.lastError.message}`)
            }
            return resolve(response)
          })
        }
        return resolve()
      })
    })
  })
}

async function appendError(error) {
  logger.info(`appending error`, error)
  return new Promise(resolve => {
    chrome.storage.sync.get(storage => {
      const errors = [...storage.errors, error]
      chrome.storage.sync.set({ errors }, resolve)
    })
  })
}

function setupTabListeners() {
  chrome.tabs.onRemoved.addListener((tabId, removed) => {
    chrome.storage.sync.get(storage => {
      if (storage.tabId === tabId) {
        const updatedStorage = {
          ...storage,
          tabId: null,
          activeVideo: null
        }
        chrome.alarms.clearAll(() => {
          logger.info(`cleared all alarms`)
          chrome.storage.sync.set(updatedStorage, () => {
            logger.info(`reset active video`)
          })
        })
      }
    })
  })
}

async function getStorage() {
  return new Promise(resolve => {
    chrome.storage.sync.get(storage => {
      return resolve(storage)
    })
  })
}

export async function main(options = { videos: [] }) {
  if (options.mockChrome) {
    chrome = options.mockChrome
    logger.info(`background: set chrome`, options.mockChrome)
  }
  enableExtension({})
  setupMessageListener()
  setupAlarmListeners()
  setupTabListeners()

  await setInitialState({ videos: options.videos })
}

export default {
  main,
  addVideo,
  removeVideo,
  playVideo,
  stopVideo,
  initialState
}