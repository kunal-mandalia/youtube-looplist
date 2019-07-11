const noop = () => {}

// Log levels
const SILENT = 'silent'
const INFO = 'info'
const ERROR = 'error'
const DEFAULT_LOG_LEVEL = INFO

const logLevels = [
  INFO,
  ERROR,
  SILENT
]

class Logger {
  constructor(props = {}) {
    this.logLevel = props.logLevel || DEFAULT_LOG_LEVEL
  }

  setLogLevel = level => this.logLevel = level

  _output = (logLevel, ...args) => {
    const shouldOutput = logLevels.indexOf(logLevel) >= logLevels.indexOf(this.logLevel)
    if (shouldOutput) {
      console.log(`${logLevel}: `, ...args)
    }
  }

  info = (...args) => {
    this._output(INFO, ...args)
  }

  error = (...args) => {
    this._output(ERROR, ...args)
  }
}

export const logger = new Logger({ logLevel: SILENT })