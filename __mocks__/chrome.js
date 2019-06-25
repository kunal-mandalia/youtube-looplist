const minToMs = minutes => minutes * 1000 * 60

class MockChrome {
  constructor() {
    this._alarms = {}
    this._messages = []

    this.messageListeners = []
    this.alarmListeners = []
    
    this.declarativeContent = {
      onPageChanged: {
        addRules: jest.fn(),
        removeRules: jest.fn()
      }
    }
    this.runtime = {
      onInstalled: { addListener: jest.fn() },
      sendMessage: this._sendMessage,
      onMessage: {
        addListener: this._addListener
      }
    }
    this.tabs = {
      query: (q, cb) => { cb([{ id: 1 }]) },
      sendMessage: this._tabSendMessage
    }
    this.alarms = {
      create: this._alarmCreate,
      onAlarm: {
        addListener: this._addAlarmListener
      },
      clearAll: this._clearAllAlarms
    }
  }

  _sendResponse = (message) => {
    this._messages.push(message)
  }

  _sendMessage = (message, callback) => {
    this._messages.push(message)
    this.messageListeners.forEach(handler => {
      handler(message, {}, callback)
    })
  }

  _addListener = (fn) => {
    this.messageListeners.push(fn)
  }

  _tabSendMessage = (tab, message, callback) => {
    this._messages.push(message)
    this.messageListeners.forEach(handler => {
      handler(message, tab, callback)
    })
  }

  _alarmCreate = (name, alarmInfo = {}) => {
    const interval = setInterval(() => { this._notifyAlarmListeners({ name, ...alarmInfo }) }, minToMs(alarmInfo.periodInMinutes))
    this._alarms[name] = {
      interval,
      alarmInfo
    }
  }

  _addAlarmListener = (callback) => {
    this.alarmListeners.push(callback)
  }

  _notifyAlarmListeners = (alarmInfo) => {
    this.alarmListeners.forEach(listener => {
      listener(alarmInfo)
    })
  }

  _clearAllAlarms = () => {
    console.log(">>> alarms", this._alarms)
    Object.values(this._alarms).forEach(alarm => {
      console.log('clearing', alarm)
      clearInterval(alarm.interval)
    })
  }
}

const mockChrome = new MockChrome()

global.chrome = mockChrome
