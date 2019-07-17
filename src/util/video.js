async function play (start) {
  const video = document.querySelector('video')
  video.currentTime = start
  await video.play()
}

async function stop () {
  const video = document.querySelector('video')
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