import { logger } from './util/logger.js'

logger.info(`popup.js invoked`, chrome.storage.sync)

const activeLoopDetails = document.getElementById('text-active-loop-details')
const containerStartLoop = document.getElementById('container-start-loop')
const containerStopLoop = document.getElementById('container-stop-loop')
const buttonStopLoops = document.getElementById('button-stop-loops')


function syncStorageToDom() {
  getLoopInfo(loops => {
    logger.info(`syncStorageToDom`, loops)
    const loopNodes = document.getElementById('loop-nodes')

    Object.values(loops).forEach(loop => {
      const loopNode = document.createElement('div')
      loopNode.innerHTML = JSON.stringify(loop)
      loopNodes.appendChild(loopNode)
    })
  })
}

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

    activeLoopDetails.innerHTML = JSON.stringify(response)
    containerStartLoop.style.display = 'none'
    containerStopLoop.style.display = 'block'
    buttonStopLoops.disabled = false

  })
}

function stopLoops() {
  chrome.alarms.clearAll(wasCleared => {
    logger.info(`stop loops ${wasCleared ? 'cleared' : 'not cleared'}`)

    activeLoopDetails.innerHTML = ''
    containerStartLoop.style.display = 'block'
    containerStopLoop.style.display = 'block'
    buttonStopLoops.disabled = true
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

function getLoopInfo(callback) {
  chrome.storage.sync.get(undefined, result => {
    callback(result)
  })
}

function clearLoops(callback) {
  chrome.storage.sync.clear(callback)
}

function setVideoAvailability(callback = () => {}) {
  const message = {
    type: 'VIDEO_AVAILABLE'
  }
  chrome.runtime.sendMessage(message, response => {
    logger.info(`popup getVideoAvailability response`, response)
    chrome.storage.sync.set({ 'VIDEO_AVAILABLE': response.data }, callback)
  })
}

function getVideoAvailability(callback = () => {}) {
  chrome.storage.sync.get(['VIDEO_AVAILABLE'], value => {
    callback(value)
  })
}

function main() {
  setupHandlers()
  syncStorageToDom()
}

main()

export default {
  startLoop,
  stopLoops,
  getLoopInfo,
  clearLoops,
  getVideoAvailability,
  setVideoAvailability
}