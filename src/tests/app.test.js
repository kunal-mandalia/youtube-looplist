import popup from '../popup/src/popup.js'
import content from '../content/content_main.js'
import background from '../background/background.js'
import video from '../util/video.js'
import time from '../util/time.js'

jest.useFakeTimers()
jest.mock('../util/video.js')

beforeAll(() => {
  video.play.mockImplementation(async () => { return true })
  video.stop.mockImplementation(async () => { return true })
  video.isAvailable.mockImplementation(() => { return true })
})

beforeEach(async () => {
  chrome.mockReset()
  jest.clearAllTimers()
  video.play.mockClear()
  video.stop.mockClear()
  video.isAvailable.mockClear()

  await content.main()
  await background.main({ mockChrome: chrome, videos: [] })
})

describe(`app`, () => {
  describe.only(`add video to playlist`, () => {
    it(`should add video to playlist`, async () => {
      const input = {
        newVideo: {
          name: 'Best Day Ever',
          url: 'mocktube.com/abc',
          startTime: '01:10',
          stopTime: '4:44'
        }
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: {
          "activeVideo": null,
          "tabId": null,
          "videos": [
            { "name": "Best Day Ever", "startTime": "01:10", "stopTime": "4:44", "url": "mocktube.com/abc" }
          ]
        }
      }

      chrome.storage.sync.get(storage => {
        expect(storage).toMatchObject(background.initialState)
      })

      const response = await popup.addVideo(input.newVideo)
      expect(response).toEqual(expected.response)

      expect(chrome.storage.sync.get(storage => {
        expect(storage).toMatchObject(expected.storage)
      }))
    })
  })

  describe(`remove video from playlist`, () => {
    it(`should remove video from playlist`, async () => {
      const input = {
        newVideo: {
          name: 'OST',
          url: 'mocktube.com/abc',
          startTime: '01:10',
          stopTime: '4:44'
        }
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: background.initialState
      }

      await popup.addVideo(input.newVideo)

      let videoId
      expect(chrome.storage.sync.get(storage => {
        expect(storage.videos).toHaveLength(1)
        videoId = storage.videos[0].id
      }))

      const response = await popup.removeVideo(videoId)
      expect(response).toMatchObject(expected.response)

      expect(chrome.storage.sync.get(storage => {
        expect(storage).toMatchObject(expected.storage)
      }))
    })
  })

  describe(`play video on loop`, () => {
    it(`should play video on loop`, async () => {
      const input = {
        newVideo: {
          name: 'Mock You',
          url: 'mocktube.com/abc',
          startTime: '02:10',
          stopTime: '4:10'
        },
        wait: time.convertToMilliseconds(20)
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: { "videos": [] },
        loopCount: 10,
        startTimeSeconds: 130
      }

      await popup.addVideo(input.newVideo)

      let videoId
      chrome.storage.sync.get(storage => {
        expect(storage.videos).toHaveLength(1)
        videoId = storage.videos[0].id
      })

      await popup.playVideo({
        id: videoId,
        loop: true
      })

      jest.advanceTimersByTime(input.wait)

      expect(video.play).toBeCalledTimes(expected.loopCount)
      video.play.mock.calls.forEach(c => {
        expect(c[0]).toEqual(expected.startTimeSeconds)
      })
    })
  })

  describe(`stop video`, () => {
    it(`should stop playing`, async () => {
      const input = {
        newVideo: {
          name: 'Stopper',
          url: 'mocktube.com/abc',
          startTime: '01:00',
          stopTime: '2:30'
        },
        firstWait: time.convertToMilliseconds(3),
        secondWait: time.convertToMilliseconds(6)
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: { "videos": [] },
        loopCount: 2
      }

      await popup.addVideo(input.newVideo)

      let videoId
      chrome.storage.sync.get(storage => {
        expect(storage.videos).toHaveLength(1)
        videoId = storage.videos[0].id
      })

      await popup.playVideo({
        id: videoId,
        loop: true
      })

      jest.advanceTimersByTime(input.firstWait)
      expect(video.play).toBeCalledTimes(expected.loopCount)

      await popup.stopVideo()

      jest.advanceTimersByTime(input.secondWait)
      expect(video.play).toBeCalledTimes(expected.loopCount)
    })
  })

  describe(`close browser tab`, () => {
    it(`should stop playing`, async () => {
      const input = {
        newVideo: {
          name: 'Tabber',
          url: 'mocktube.com/abc',
          startTime: '02:10',
          stopTime: '4:10'
        },
        wait: time.convertToMilliseconds(10)
      }
      const expected = {
        response: {
          status: 'OK'
        },
        storage: { "videos": [] },
        loopCount: 0
      }

      await popup.addVideo(input.newVideo)

      let videoId
      chrome.storage.sync.get(storage => {
        expect(storage.videos).toHaveLength(1)
        videoId = storage.videos[0].id
      })

      await popup.playVideo({
        id: videoId,
        loop: true
      })

      chrome.closeTab(1)

      jest.advanceTimersByTime(input.wait)
      expect(video.play).toBeCalledTimes(expected.loopCount)
    })
  })
})