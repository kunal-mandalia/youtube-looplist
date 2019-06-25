import { logger } from './util/logger.js'

logger.info(`popup.js invoked`)

function startLoop(tabId, startTime, endTime) {
  const message = {
    type: 'START_LOOP',
    payload: {
      tabId,
      startTime,
      endTime
    }
  }
  chrome.runtime.sendMessage(message, response => {
    logger.info(`popup startLoop response`, response)
  })
}

function stopLoops() {
  chrome.alarms.clearAll(wasCleared => {
    logger.info(`stop loops ${wasCleared ? 'cleared' : 'not cleared'}`)
  })
}

function setupHandlers() {
  const startLoopButton = document.getElementById('button-start-loop')
  startLoopButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const startTime = document.getElementById('input-start-time').value
      const endTime = document.getElementById('input-end-time').value
      logger.info(`starting loop`, startTime, endTime)
      startLoop(tabs[0].id, startTime, endTime)
    })
  })

  const stopLoopsButton = document.getElementById('button-stop-loops')
  stopLoopsButton.addEventListener('click', () => {
    stopLoops()
  })
}

function main() {
  setupHandlers()
}

main()

export default {
  startLoop
}