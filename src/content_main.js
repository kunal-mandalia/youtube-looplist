import { logger } from './util/logger.js'
import { youtubeTimeLoop } from './YouTubeTimeLoop.js'

logger.info(`content_main invoked`)

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
  logger.info(`DOM`, document.getElementById('video'))
  const video = document.querySelector(`video`)

  logger.info(`assignVideo`, video)

  if (video) {
    youtubeTimeLoop.setVideo(video)
  }
}

function main () {
  logger.info(`content_main main() invoked`)
  
  assignVideo()
  setupMessageListener()
}

main()

export default {}