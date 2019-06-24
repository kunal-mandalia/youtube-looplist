import popup from './src/popup.js'
import content from './src/content_main.js'
import background from './src/background'
import { youtubeTimeLoop } from './src/YouTubeTimeLoop'

const mockVideo = {
  play: jest.fn()
}

beforeAll(() => {
  youtubeTimeLoop.setVideo(mockVideo)
})

describe(`app`, () => {
  describe(`start loop`, () => {
    it.only(`should start playing the video`, () => {
      popup.startLoop("1:10", "1:15")
      expect(mockVideo.play).toBeCalled()
    })

    it(`should loop the video between start and end time`, () => {
      // message: START_LOOP with args
      // observe video play count n times
    })
  })

  describe(`stop loop`, () => {
    it(`should stop playing the video`, () => {

    })

    it(`should not loop the video`, () => {

    })
  })
})