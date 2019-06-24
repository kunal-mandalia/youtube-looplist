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

  // cancelTimeLoops = () => {
  //   Object.keys(this.intervals).forEach(interval => {
  //     clearInterval(interval)
  //     delete this.intervals[interval]
  //   })
  // }

  play = startTime => {
    const start = YouTubeTimeLoop.convertToSeconds(startTime)
    this.video.currentTime = start
    this.video.play()
  }

  // startLoop = (startTime, endTime) => {
  //   const start = YouTubeTimeLoop.convertToSeconds(startTime)
  //   const end = YouTubeTimeLoop.convertToSeconds(endTime)
  //   const intervalLength = (end - start) * 1000
  //   console.log(`intervalLength`, intervalLength)

  //   console.log(`this.video`, this.video)

  //   this.video.currentTime = start
  //   this.video.play()

  //   // const interval = setInterval(() => {
  //   //   console.log(`tick`)
  //   //   this.video.currentTime = start
  //   // }, intervalLength)
  //   // console.log(`interval`, interval)
  //   // this.intervals[interval] = true

  //   // chrome.alarms.create("video", {
  //   //   when: Date.now(),
  //   //   periodInMinutes: 0.1
  //   // })
  // }
}

const youtubeTimeLoop = new YouTubeTimeLoop()

export {
  youtubeTimeLoop
}