global.document = global.document || {}

global.document.getElementById = () => ({
  style: {},
  addEventListener: () => {}
})