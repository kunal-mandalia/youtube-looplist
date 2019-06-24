import { startLoop } from './src/popup.js'
import {
  main as contentMain
} from './src/content_main.js'

const mockVideo = {
  play: jest.fn()
}

global.document.querySelector = jest.fn().mockImplementation(query => {
  if (query === 'video') {
    return mockVideo
  }
  return null
})

beforeAll(() => {
  contentMain()
})

describe.skip(`app`, () => {
  describe(`start loop`, () => {
    it(`should start playing the video`, () => {
      // message: START_LOOP with args
      startLoop("1:10", "1:15")
      //  -- stub chrome messaging
      //  -- stub chrome alarm
      //  -- stub video
      // observe video.play called
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