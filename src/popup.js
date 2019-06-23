import { logger } from './util/logger.js'

logger.info(`popup.js invoked`)

chrome.runtime.sendMessage({ type: 'PING' }, response => {
  logger.info(`ping response`, response)
})