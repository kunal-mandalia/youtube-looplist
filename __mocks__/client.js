import { JSDOM } from "jsdom"
const dom = new JSDOM(`<body>
  <video id='video' />
</body>`)
global.document = dom.window.document
global.window = dom.window

class MockChrome {
  constructor() {
    this.messages = []
    this.messageHandlers = []
    
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
      create: this._alarmCreate
    }
  }

  _sendResponse = (message) => {
    this.messages.push(message)
  }

  _sendMessage = (message, callback) => {
    this.messages.push(message)
    this.messageHandlers.forEach(handler => {
      handler(message, {}, callback)
    })
  }

  _addListener = (fn) => {
    this.messageHandlers.push(fn)
  }

  _tabSendMessage = (tab, message, callback) => {
    this.messages.push(message)
    this.messageHandlers.forEach(handler => {
      handler(message, tab, callback)
    })
  }

  _alarmCreate = () => {}

  _onAlarm = () => {}
}

const mockChrome = new MockChrome()

global.chrome = mockChrome