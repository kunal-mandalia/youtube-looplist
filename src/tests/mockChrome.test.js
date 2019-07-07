import time from '../util/time.js'

jest.useFakeTimers()

afterEach(() => {
  chrome.mockReset()
})

describe('mock chrome', () => {
  it('should be defined', () => {
    expect(chrome).toBeDefined()
  })

  it('should allow alarm listeners to be added', () => {
    const mockListener = jest.fn()
    chrome.alarms.onAlarm.addListener(mockListener)

    expect(chrome.alarmListeners).toEqual([mockListener])
  })

  it('should allow alarm to be created', () => {
    const alarmInfo = { periodInMinutes: 2 }
    chrome.alarms.create('MOCK_ALARM', alarmInfo)

    expect(chrome._alarms).toMatchObject({"MOCK_ALARM": {"alarmInfo": {"periodInMinutes": 2}}})
  })

  it('should notify alarm listeners when alarm goes off', () => {
    const mockListener = jest.fn()
    chrome.alarms.onAlarm.addListener(mockListener)

    const alarmInfo = { periodInMinutes: 2 }
    chrome.alarms.create('MOCK_ALARM', alarmInfo)

    jest.advanceTimersByTime(time.convertToMilliseconds(10))
    expect(mockListener).toBeCalledTimes(5)
  })
})