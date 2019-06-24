class YouTubeTimeLoop {
  constructor(options = {}) {
    this.video = options.video
    this.intervals = {}
  }

  static convertToSeconds(timeString) {
    const [m, s] = timeString.split(":")
    return (parseInt(m, 10) * 60) + (parseInt(s, 10))
  }

  setVideo = video => {
    this.video = video
  }

  play = startTime => {
    const start = YouTubeTimeLoop.convertToSeconds(startTime)
    this.video.currentTime = start
    this.video.play()
  }
}

const youtubeTimeLoop = new YouTubeTimeLoop()

export {
  youtubeTimeLoop
}