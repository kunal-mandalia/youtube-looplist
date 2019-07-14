const minToMs = minutes => minutes * 1000 * 60
const noop = () => {}

class MockChrome {
  constructor() {
    this._alarms = {}
    this._messages = []
    this._storage = {}

    this.messageListeners = []
    this.alarmListeners = []
    this.onRemovedTabListeners = []

    this.mockReset = this.mockReset.bind(this)
    this.closeTab = this.closeTab.bind(this)
    this._sendResponse = this._sendResponse.bind(this)
    this._sendMessage = this._sendMessage.bind(this)
    this._addMessageListener = this._addMessageListener.bind(this)
    this._tabSendMessage = this._tabSendMessage.bind(this)
    this._alarmCreate = this._alarmCreate.bind(this)
    this._addAlarmListener = this._addAlarmListener.bind(this)
    this._notifyAlarmListeners = this._notifyAlarmListeners.bind(this)
    this._clearAllAlarms = this._clearAllAlarms.bind(this)
    this._setStorage = this._setStorage.bind(this)
    this._getStorage = this._getStorage.bind(this)
    this._clearStorage = this._clearStorage.bind(this)
    this._addTabRemoveListener = this._addTabRemoveListener.bind(this)
    this._updateTab = this._updateTab.bind(this)
    
    this.declarativeContent = {
      onPageChanged: {
        addRules: noop,
        removeRules: noop
      }
    }
    this.runtime = {
      onInstalled: { addListener: noop },
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

  mockReset() {
    this._clearAllAlarms()
    this._alarms = {}
    this._messages = []
    this._storage = {}
    
    this.messageListeners = []
    this.alarmListeners = []
    this.onRemovedTabListeners = []
  }

  closeTab(id) {
    this.onRemovedTabListeners.forEach(listener => {
      listener(id, true)
    })
  }

  _sendResponse(message) {
    this._messages.push(message)
  }

  _sendMessage(message, callback) {
    this._messages.push(message)
    this.messageListeners.forEach(handler => {
      handler(message, {}, callback)
    })
  }

  _addMessageListener(handler) {
    this.messageListeners.push(handler)
  }

  _tabSendMessage(tab, message, callback) {
    this._messages.push(message)
    this.messageListeners.forEach(handler => {
      handler(message, tab, callback)
    })
  }

  _alarmCreate(name, alarmInfo = {}) {
    const interval = setInterval(() => {
      this._notifyAlarmListeners({ name, ...alarmInfo })
    }, minToMs(alarmInfo.periodInMinutes))

    this._alarms[name] = {
      interval,
      alarmInfo
    }
  }

  _addAlarmListener(callback) {
    this.alarmListeners.push(callback)
  }

  _notifyAlarmListeners(alarmInfo) {
    this.alarmListeners.forEach(listener => {
      listener(alarmInfo)
    })
  }

  _clearAllAlarms(callback = ()=> {}) {
    Object.values(this._alarms).forEach(alarm => {
      clearInterval(alarm.interval)
    })
    callback()
  }

  _setStorage(item, callback = () => {}) {
    this._storage = { ...this._storage, ...item }
    callback(item)
  }

  _getStorage(a, b) {
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

  _clearStorage(callback = () => {}) {
    this._storage = {}
    callback({})
  }

  _addTabRemoveListener(listener) {
    this.onRemovedTabListeners.push(listener)
  }

  _updateTab(tabId, update, callback = () => {}) {
    callback()
  }
}

export const chrome = new MockChrome()