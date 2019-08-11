import MockChrome from './MockChrome'

const options = {
  unknownTabs: [404]
}
const chrome = new MockChrome(options)
export { chrome }
