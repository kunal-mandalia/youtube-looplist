import { logger } from './util/logger.js'
import { youtubeTimeLoop } from './YouTubeTimeLoop.js'


function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logger.info(`content received message`, message, sender)

    if (!message || !message.type) {
      return logger.error(`unhandled message`, message, sender)
    }
  
    if (message.type === "PLAY_VIDEO") {
      const { startTime } = message.payload
      youtubeTimeLoop.play(startTime)
      return sendResponse({ status: "OK" })
    }

    if (message.type === "VIDEO_AVAILABLE") {
      const video = document.querySelector(`video`)
      return sendResponse({ data: !!video })
    }
  })
}

function assignVideo () {
  const video = document.querySelector(`video`)
  logger.info(`assignVideo`, video)
  if (video) {
    youtubeTimeLoop.setVideo(video)
  }
}

export function main () {
  logger.info(`content_main.js invoked`)
  
  assignVideo()
  setupMessageListener()
}

export default {
  main
}