async function play (start) {
  const video = document.querySelector('video')
  video.currentTime = start
  await video.play()
}

function isAvailable () {
  const video = document.querySelector(`video`)
  return !!video
}

export default {
  play,
  isAvailable
}