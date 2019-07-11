const { logger } = require('../util/logger.js')

global.console = {
  log: jest.fn()
}

afterEach(() => {
  global.console.log.mockReset()
  logger.setLogLevel('silent')
})

describe(`logger`, () => {
  describe(`given a log level of info`, () => {
    beforeEach(() => {
      logger.setLogLevel('info')
    })

    it(`should log info`, () => {
      const expected = [`info: `, `service online`]
      logger.info(`service online`)
      expect(global.console.log).toBeCalledWith(...expected)
    })
    
    it(`should log error`, () => {
      const expected = [`error: `, `service offline`]
      logger.error(`service offline`)
      expect(global.console.log).toBeCalledWith(...expected)
    })
  })

  describe('given a log level of error', () => {
    beforeEach(() => {
      logger.setLogLevel('error')
    })

    it('should not log info', () => {
      logger.info(`service online`)
      expect(global.console.log).not.toBeCalled()
    })

    it('should log error', () => {
      const expected = [`error: `, `service offline`]
      logger.error(`service offline`)
      expect(global.console.log).toBeCalledWith(...expected)
    })
  })

  describe('given a log level of silent', () => {
    beforeEach(() => {
      logger.setLogLevel('silent')
    })

    it('should not log error', ()=> {
      logger.error(`service offline`)
      expect(global.console.log).not.toBeCalled()
    })
  })
})