const { logger } = require('./logger.js')

global.console.log = jest.fn()

afterEach(() => {
  global.console.log.mockReset()
})

describe(`logger`, () => {
  it(`should log info`, () => {
    const input = `service online`
    const expected = [`info: `, `service online`]
    const actual = logger.info(`service online`)
    expect(global.console.log).toBeCalledWith(...expected)
  })

  it(`should log error`, () => {
    const input = `service offline`
    const expected = [`error: `, `service offline`]
    const actual = logger.error(`service offline`)
    expect(global.console.log).toBeCalledWith(...expected)
  })
})