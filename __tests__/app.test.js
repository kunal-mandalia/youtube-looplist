import popup from '../src/popup.js'
import content from '../src/content_main.js'
import background from '../src/background.js'
import video from '../src/util/video.js'
import time from '../src/util/time.js'

jest.useFakeTimers()
jest.mock('../src/util/video.js')

beforeAll(() => {
  video.play.mockImplementation(async () => { return true })
  video.isAvailable.mockImplementation(() => { return true })
})

beforeEach(async () => {
  chrome.mockReset()
  jest.clearAllTimers()
  video.play.mockClear()
  video.isAvailable.mockClear()
  
  await content.main()
  await popup.main()
  await background.main()
})

/**
 * TODO: direct calls to background methods should be replaced 
 * by calls to popup as they're closer to the user.
 * There's an issue with timers not executing when messages passed 
 * from popup in jest
 */
describe(`app`, () => {
  describe(`add video to playlist`, () => {
    it(`should add video to playlist`, async () => {
      const input = {
        newVideo: {
          id: 'VIDEO_001',
          url: 'mocktube.com/abc',
          start: '01:10',
          stop: '4:44'
        }
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: {"videos": [{"id": "VIDEO_001", "start": "01:10", "stop": "4:44", "url": "mocktube.com/abc"}]}
      }

      await popup.addVideo(input.newVideo, response => {
        expect(response).toEqual(expected.response)
      })

      expect(chrome.storage.sync.get(storage => {
        expect(storage).toEqual(expected.storage)
      }))
    })
  })

  describe(`remove video from playlist`, () => {
    it(`should remove video from playlist`, async () => {
      const input = {
        newVideo: {
          id: 'VIDEO_001',
          url: 'mocktube.com/abc',
          start: '01:10',
          stop: '4:44'
        }
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: {"videos": []}
      }

      await popup.addVideo(input.newVideo)
      expect(chrome.storage.sync.get(storage => {
        expect(storage.videos).toHaveLength(1)
      }))

      const response = await popup.removeVideo('VIDEO_001')
      expect(response).toEqual(expected.response)

      expect(chrome.storage.sync.get(storage => {
        expect(storage).toEqual(expected.storage)
      }))
    })
  })

  describe(`play video on loop`, () => {
    it(`should play video on loop`, async () => {
      const input = {
        newVideo: {
          id: 'VIDEO_001',
          url: 'mocktube.com/abc',
          start: '02:10',
          stop: '4:10'
        },
        wait: time.convertToMilliseconds(20)
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: {"videos": []},
        loopCount: 10,
        startTimeSeconds: 130
      }

      await popup.addVideo(input.newVideo)
      await background.playVideo({
        id: 'VIDEO_001',
        loop: true,
        tabId: 1
      })
      
      jest.advanceTimersByTime(input.wait)

      expect(video.play).toBeCalledTimes(expected.loopCount)
      video.play.mock.calls.forEach(c => {
        expect(c[0]).toEqual(expected.startTimeSeconds)
      })
    })
  })

  describe(`play video one time`, () => {
    it(`should play video once`, () => {

    })
  })

  describe(`stop video`, () => {
    it(`should stop playing`, async () => {
      const input = {
        newVideo: {
          id: 'VIDEO_001',
          url: 'mocktube.com/abc',
          start: '01:00',
          stop: '2:30'
        },
        firstWait: time.convertToMilliseconds(3),
        secondWait: time.convertToMilliseconds(6)
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: {"videos": []},
        loopCount: 2
      }

      await popup.addVideo(input.newVideo)
      await background.playVideo({
        id: 'VIDEO_001',
        loop: true,
        tabId: 1
      })

      jest.advanceTimersByTime(input.firstWait)
      expect(video.play).toBeCalledTimes(expected.loopCount)

      await background.stopVideo()
      
      jest.advanceTimersByTime(input.secondWait)
      expect(video.play).toBeCalledTimes(expected.loopCount)
    })
  })

  describe(`close browser tab`, () => {
    it(`should stop playing`, async () => {
      const input = {
        newVideo: {
          id: 'VIDEO_001',
          url: 'mocktube.com/abc',
          start: '02:10',
          stop: '4:10'
        },
        wait: time.convertToMilliseconds(10)
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: {"videos": []},
        loopCount: 0
      }

      await popup.addVideo(input.newVideo)
      await background.playVideo({
        id: 'VIDEO_001',
        loop: true,
        tabId: 1
      })

      chrome.closeTab(1)

      jest.advanceTimersByTime(input.wait)
      expect(video.play).toBeCalledTimes(expected.loopCount)
    })
  })
})