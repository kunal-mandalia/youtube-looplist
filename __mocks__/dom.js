import { JSDOM } from "jsdom"

const dom = new JSDOM(`<body>
  <video id='video' />
</body>`)


global.document = dom.window.document
global.window = dom.window
