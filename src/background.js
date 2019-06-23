import { logger } from './util/logger.js'

logger.info(`background.js is running`)

export const noop = () => {}

function conditionallyEnableExtension(conditions = {}) {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: conditions.hostEquals},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }])
      logger.info(`added rule to whitelist host`)
    })
  })
}

function main() {
  // enable extension depending on host
  conditionallyEnableExtension({ hostEquals: 'localhost' })
}

main()