/* eslint-disable no-undef */
import { logger } from 'util/logger.js'

logger.info(`popup invoked`)

async function sendMessage({ message }) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs[0].id) {
        const tabId = tabs[0].id
        const messageWithTabId = {
          ...message,
          payload: {
            ...message.payload,
            tabId
          }
        }
        logger.info(`sending message ${JSON.stringify(messageWithTabId)}`)
        chrome.runtime.sendMessage(messageWithTabId, response => {
          return resolve(response)
        })
      } else {
        return reject()
      }
    })
  })
}

async function addVideo (video = {}) {
  logger.info(`popup add video`)
  const ADD_VIDEO_MESSAGE = {
    type: 'ADD_VIDEO_REQUEST',
    payload: {
      video
    }
  }
  return await sendMessage({ message: ADD_VIDEO_MESSAGE })
}

async function removeVideo (id) {
  const REMOVE_VIDEO_MESSAGE = {
    type: 'REMOVE_VIDEO_REQUEST',
    payload: {
      id
    }
  }
  return await sendMessage({ message: REMOVE_VIDEO_MESSAGE })
}

async function playVideo({ id, loop }) {
  const PLAY_VIDEO_REQUEST_MESSAGE = {
    type: 'PLAY_VIDEO_REQUEST',
    payload: { id, loop }
  }
  return await sendMessage({ message: PLAY_VIDEO_REQUEST_MESSAGE })
}

async function stopVideo() {
  const STOP_VIDEO_REQUEST_MESSAGE = {
    type: 'STOP_VIDEO_REQUEST'
  }
  return await sendMessage({ message: STOP_VIDEO_REQUEST_MESSAGE })
}

async function getStorage() {
  const GET_STORAGE_REQUEST_MESSAGE = {
    type: 'GET_STORAGE_REQUEST'
  }
  return await sendMessage({ message: GET_STORAGE_REQUEST_MESSAGE })
}

function setChrome(mockChrome) {
  chrome = mockChrome
}

export default {
  addVideo,
  removeVideo,
  playVideo,
  stopVideo,
  getStorage,
  setChrome
}