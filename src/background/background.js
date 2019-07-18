import { logger } from '../util/logger.js'
import time from '../util/time.js'

logger.info(`background.js is running`)
let chrome = window.chrome

const initialState = {
  activeVideo: null,
  videos: []
}

async function setInitialState({ videos }) {
  return new Promise(async (resolve) => {
    await stopVideo({})
    chrome.storage.sync.set({ ...initialState, videos }, resolve)
    logger.info(`set initial state`, initialState)
  })
}

function enableExtension(conditions = {}) {
  logger.info(`enableExtension`, chrome)
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
        break;

      case 'REMOVE_VIDEO_REQUEST':
        removeVideo(message.payload.id)
          .then(result => { sendResponse(result) })
        return true
        break;

      case 'PLAY_VIDEO_REQUEST':
        chrome.storage.sync.get(({ activeVideo }) => {
          if (activeVideo) {
            stopVideo({ tabId: activeVideo.tabId })
              .then(() => playVideo({ ...message.payload }))
              .then(result => { sendResponse(result) })
          } else {
            playVideo({ ...message.payload })
              .then(result => { sendResponse(result) })
          }
        })
        return true
        break;

      case 'STOP_VIDEO_REQUEST':
        chrome.storage.sync.get(({ activeVideo }) => {
          if (!activeVideo) {
            logger.error(`Stop video requested but active video`)
            sendResponse({ status: 'ERROR' })
          }
          stopVideo({ tabId: activeVideo.tabId })
            .then(result => { sendResponse(result) })
        })
        return true
        break;

      case 'GET_STORAGE_REQUEST':
        getStorage()
          .then(result => { sendResponse(result) })
        return true
        break;

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
        const { activeVideo } = storage
        if (!activeVideo) logger.error(`cannot play video when activeVideo is not set`)

        const { tabId, startSeconds } = activeVideo
        logger.info(`sending message to tabId ${tabId}`)
        chrome.tabs.sendMessage(tabId, {
          type: "PLAY_VIDEO",
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
      const videos = storage.videos || []
      const updatedStorage = {
        ...storage,
        videos: [
          ...videos,
          {
            ...video,
            id: Date.now()
          }
        ]
      }
      chrome.storage.sync.set(updatedStorage, () => {
        return resolve({ status: "OK" })
      })
    })
  })
}

async function removeVideo(id) {
  return new Promise(resolve => {
    chrome.storage.sync.get(storage => {
      const videos = (storage.videos || []).filter(video => video.id !== id)
      const updatedStorage = {
        ...storage,
        videos
      }
      chrome.storage.sync.set(updatedStorage, () => {
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

async function playVideo({ id, loop, tabId }) {
  logger.info(`background.js playVideo`, id, loop, tabId)
  const video = await getVideoById(id)
  logger.info(`video`, video)
  await stopVideo({ tabId })
  logger.info(`stopped existing video`)
  await redirectToVideo({
    tabId: video.tabId,
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
        if (response.data === true) {
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
      tabId,
      startSeconds: time.convertToSeconds(startTime),
      stopSeconds: time.convertToSeconds(stopTime),
    }
    chrome.storage.sync.set({ activeVideo }, resolve)
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
            return resolve(response)
          })
        }
        return resolve()
      })
    })
  })
}

function setupTabListeners() {
  chrome.tabs.onRemoved.addListener((tabId, removed) => {
    chrome.storage.sync.get(storage => {
      if (storage.activeVideo && storage.activeVideo.tabId === tabId) {
        const updatedStorage = {
          ...storage,
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
      resolve(storage)
    })
  })
}

export async function main(options = { videos: [] }) {
  if (options.mockChrome) {
    chrome = options.mockChrome
    logger.info(`background: set chrome`, options.mockChrome)
  }
  enableExtension({ })
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