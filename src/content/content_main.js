import { logger } from '../util/logger.js'
import video from '../util/video.js'

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.info(`content received message`, message, sender)

    switch (message.type) {
      case 'PLAY_VIDEO':
        const { startSeconds } = message.payload
        video.play(startSeconds)
          .then(() => { sendResponse({ status: 'OK' }) })
        return true
        break

      case 'IS_VIDEO_AVAILABLE':
        return sendResponse({ data: !!video.isAvailable() })
        break
      
      case 'STOP_VIDEO':
        video.stop()
          .then(() => sendResponse({ status: 'OK'}))
        return true
        break
  
      default:
        logger.error(`content did not handle message`, message, sender)
        break
    }

    return true
  })
}

export function main (options = {}) {
  if (options.mockChrome) {
    chrome = options.mockChrome
  }
  logger.info(`content_main.js invoked`)
  setupMessageListener()
}

export default {
  main
}