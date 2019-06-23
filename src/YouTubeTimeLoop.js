import { logger } from './util/logger.js'

class YouTubeTimeLoop {
  constructor() {
    this.video = null
  }

  foo = () => {
    logger.info(`bar`)
  }

  setVideo = video => {
    this.video = video
  }
}

const youtubeTimeLoop = new YouTubeTimeLoop()

export {
  youtubeTimeLoop
}

