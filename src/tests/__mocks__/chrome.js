const minToMs = minutes => minutes * 1000 * 60

class MockChrome {
  constructor() {
    this._alarms = {}
    this._messages = []
    this._storage = {}

    this.messageListeners = []
    this.alarmListeners = []
    this.onRemovedTabListeners = []
    
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
        addListener: this._addMessageListener
      }
    }
    this.tabs = {
      query: (q, cb) => { cb([{ id: 1 }]) },
      sendMessage: this._tabSendMessage,
      onRemoved: {
        addListener: this._addTabRemoveListener
      },
      update: this._updateTab
    }
    this.alarms = {
      create: this._alarmCreate,
      onAlarm: {
        addListener: this._addAlarmListener
      },
      clearAll: this._clearAllAlarms
    }
    this.storage = {
      sync: {
        set: this._setStorage,
        get: this._getStorage,
        clear: this._clearStorage
      }
    }
  }

  mockReset = () => {
    this._clearAllAlarms()
    this._alarms = {}
    this._messages = []
    this._storage = {}
    
    this.messageListeners = []
    this.alarmListeners = []
    this.onRemovedTabListeners = []
  }

  closeTab = (id) => {
    this.onRemovedTabListeners.forEach(listener => {
      listener(id, true)
    })
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

  _addMessageListener = (handler) => {
    this.messageListeners.push(handler)
  }

  _tabSendMessage = (tab, message, callback) => {
    this._messages.push(message)
    this.messageListeners.forEach(handler => {
      handler(message, tab, callback)
    })
  }

  _alarmCreate = (name, alarmInfo = {}) => {
    const interval = setInterval(() => {
      this._notifyAlarmListeners({ name, ...alarmInfo })
    }, minToMs(alarmInfo.periodInMinutes))

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

  _clearAllAlarms = (callback = () => {}) => {
    Object.values(this._alarms).forEach(alarm => {
      clearInterval(alarm.interval)
    })
    callback()
  }

  _setStorage = (item, callback = () => {}) => {
    this._storage = { ...this._storage, ...item }
    callback(item)
  }

  _getStorage = (a, b) => {
    if (typeof a === 'function') {
      return a(this._storage)
    }

    if (typeof b === 'function') {
      if (Array.isArray(a)) {
        const subObject = a.reduce((obj, key) => {
          return {
            ...obj,
            [key]: this._storage[key]
          }
        }, {})
        return b(subObject)
      }
      return b(this._storage)
    }
  }

  _clearStorage = (callback = () => {}) => {
    this._storage = {}
    callback({})
  }

  _addTabRemoveListener = (listener) => {
    this.onRemovedTabListeners.push(listener)
  }

  _updateTab = (tabId, update, callback = () => {}) => {
    callback()
  }
}

const mockChrome = new MockChrome()

global.chrome = mockChrome
