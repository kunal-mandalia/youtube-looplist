import { logger } from './util/logger.js'

logger.info(`popup.js invoked`)

function startLoop(startTime, endTime) {
  const message = {
    type: 'START_LOOP',
    payload: {
      startTime,
      endTime
    }
  }
  chrome.runtime.sendMessage(message, response => {
    logger.info(`popup startLoop response`, response)
  })
}

export default {
  startLoop
}