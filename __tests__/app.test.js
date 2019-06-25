import popup from '../src/popup.js'
import content from '../src/content_main.js'
import background from '../src/background'
import { youtubeTimeLoop } from '../src/YouTubeTimeLoop'

jest.useFakeTimers()

const mockVideo = { play: jest.fn() }

function minToMs(minutes) {
  return minutes * 1000 * 60
}

beforeAll(() => {
  content.main()
  youtubeTimeLoop.setVideo(mockVideo)
})

afterEach(() => {
  mockVideo.play.mockReset()
  popup.stopLoops()
})

describe(`app`, () => {
  describe(`start loop`, () => {
    it(`should play video on loop from start time`, () => {
      const input = {
        startTime: '1:10',
        endTime: '2:10',
        wait: minToMs(5)
      }
      const expected = {
        startTimeSeconds: 70,
        loops: 5
      }

      popup.startLoop(1, input.startTime, input.endTime)
      jest.advanceTimersByTime(input.wait)

      expect(mockVideo.play).toBeCalledTimes(expected.loops)
      mockVideo.play.mock.calls.forEach(c => {
        expect(c[0]).toEqual(expected.startTimeSeconds)
      })
    })
  })

  describe(`stop loop`, () => {
    it(`should stop playing the video`, () => {
      const input = {
        startTime: '1:10',
        endTime: '2:10',
        wait: minToMs(5)
      }
      const expected = {
        loops: 0
      }

      popup.startLoop(1, input.startTime, input.endTime)
      popup.stopLoops()
      jest.advanceTimersByTime(input.wait)

      expect(mockVideo.play).toBeCalledTimes(expected.loops)      
    })
  })
})