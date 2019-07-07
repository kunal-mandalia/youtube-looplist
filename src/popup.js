import background from './background.js'
import { logger } from './util/logger.js'

logger.info(`popup.js invoked`, chrome.storage.sync)

const activeLoopDetails = document.getElementById('text-active-loop-details')
const containerStartLoop = document.getElementById('container-start-loop')
const containerStopLoop = document.getElementById('container-stop-loop')
const buttonStopLoops = document.getElementById('button-stop-loops')


/**
 * TODO: use React to sync state to UI
 */
function setupHandlers() {
  const startLoopButton = document.getElementById('button-start-loop')
  startLoopButton.addEventListener('click', async () => {
    await playVideo({ id: 'VIDEO_0001', loop: true })
  })

  const stopLoopsButton = document.getElementById('button-stop-loops')
  stopLoopsButton.addEventListener('click', async () => {
    await stopVideo()
  })
}

function syncStorageToDom () {}

async function addVideo (video = {}) {
  return await background.addVideo(video)
}

async function removeVideo (id) {
  return await background.removeVideo(id)
}

async function playVideo({ id, loop }) {
  return new Promise((resolve, reject) => {
    logger.info(`play video promise...`)
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs && tabs[0].id) {
        const tabId = tabs[0].id
        logger.info(`play video tabId`, tabId)
        
        const PLAY_VIDEO_MESSAGE = {
          type: 'PLAY_VIDEO_REQUEST',
          payload: {
            id,
            loop,
            tabId
          }
        }
        chrome.runtime.sendMessage(PLAY_VIDEO_MESSAGE)
        return resolve()
      } else {
        return reject()
      }
    })
  })
}

async function stopVideo() {
  return new Promise((resolve) => {
    const STOP_VIDEO_MESSAGE = {
      type: 'STOP_VIDEO_REQUEST'
    }
    chrome.runtime.sendMessage(STOP_VIDEO_MESSAGE, response => {
      return resolve(response)
    })
  })
}

logger.info(`playVideo`, playVideo)

async function main() {
  setupHandlers()
  syncStorageToDom()
}

main()

export default {
  main,
  addVideo,
  removeVideo,
  playVideo,
  stopVideo
}