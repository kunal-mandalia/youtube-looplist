import { logger } from './util/logger.js'
import { youtubeTimeLoop } from './YouTubeTimeLoop.js'

logger.info(`content_main invoked`)
logger.info(`youtubeTimeLoop`, youtubeTimeLoop)

function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.info(`content received message`, message, sender)
  
    if (!message || !message.type) {
      return logger.error(`unhandled message`, message, sender)
    }
  
    if (message.type === 'PING_CONTENT') {
      logger.info(youtubeTimeLoop)
      return sendResponse({ type: 'PING_CONTENT_RESPONSE', status: 'OK' })
    }
  })
}

export function assignVideo () {
  const video = document.querySelector(`video`)

  logger.info(`assignVideo`, video)

  if (video) {
    youtubeTimeLoop.setVideo(video)
  }
}

export function main () {
  logger.info(`content_main main() invoked`)
  
  assignVideo()
  setupMessageListener()
}