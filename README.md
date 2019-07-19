# youtube-time-loop [![CircleCI](https://circleci.com/gh/kunal-mandalia/youtube-time-loop.svg?style=svg)](https://circleci.com/gh/kunal-mandalia/youtube-time-loop)
A Chrome extension to loop a segment of a YouTube video

## Demo

![App demo](/docs/app-demo-v1.gif)

## Get started

### Install
`yarn install`

### Run tests
`yarn test-all`

### Build and Run
1. `yarn build`
2. Go to `chrome://extensions`, enable developer mode, load unpacked `./dist`


## Architecture

The architecture can be split up into three parts:

1. `popup`: UI (React)
2. `background`: scripts running in the background
3. `content`: DOM interaction on page

To get a feel for how these pieces work together, consider the flow of events when the user plays a video on loop:

1. user opens `popup` by clicking on the chrome extension and clicks Play. A message is sent from popup (via the Chrome API) to schedule playing the video
2. `background` listens for the message to schedule playing the video, schedules an indefinite `alarm` and when the alarm is invoked sends a message to play the video
3. `content` listens for the message to play the video, finds the video in the DOM and uses the HTML5 `video.play()` API
