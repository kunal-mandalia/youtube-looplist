import { logger } from './logger.js'

async function play (start) {
  const video = document.querySelector('video')
  if (!video) {
    return logger.error(`failed to play video at ${start}`)
  }
  video.currentTime = start
  await video.play()
}

async function stop () {
  const video = document.querySelector('video')
  if (!video) {
    return logger.error(`failed to stop video`)
  }
  await video.pause()
}

function isAvailable () {
  const video = document.querySelector(`video`)
  return !!video
}

export default {
  play,
  stop,
  isAvailable
}