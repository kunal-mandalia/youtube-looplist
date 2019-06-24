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
    }
  })
}

function assignVideo () {
  const video = document.querySelector(`video`)
  if (video) {
    youtubeTimeLoop.setVideo(video)
  }
}

export function main () {
  logger.info(`content main invoked`)
  
  assignVideo()
  setupMessageListener()
}

export default {
  main
}