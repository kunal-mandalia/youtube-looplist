import React from 'react';
import ReactDOM from 'react-dom';
import { render, fireEvent, waitForElement } from '@testing-library/react';
import App from './App';
import content from 'content/content_main.js'
import background from 'background/background.js'
import video from 'util/video.js'
import { chrome } from 'tests/__mocks__/chrome'

jest.useFakeTimers()
jest.mock('util/video.js')

beforeAll(() => {
  video.play.mockImplementation(async () => { return true })
  video.isAvailable.mockImplementation(() => { return true })
  global.chrome = chrome
})

beforeEach(async () => {
  global.chrome.mockReset()
  jest.clearAllTimers()
  video.play.mockClear()
  video.isAvailable.mockClear()

  await content.main({ mockChrome: chrome })
  await background.main({ mockChrome: chrome })
})

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
  ReactDOM.unmountComponentAtNode(div);
});


it('should render no saved videos initially', () => {
  const { queryAllByTestId } = render(<App />)

  expect(queryAllByTestId('video')).toHaveLength(0)
})

it.only('should add a new video', async () => {
  const input = {
    video: {
      name: 'Best Day Ever',
      url: 'https://www.youtube.com/watch?v=AbV-Q6tz4B8',
      startTime: '01:10',
      stopTime: '03:45'
    }
  }
  const {
    getByText,
    getByLabelText,
    getByDisplayValue,
  } = render(<App />)

  const addVideoButton = getByText('Add Video')
  fireEvent.click(addVideoButton)

  const nameInput = getByLabelText('Name')
  const URLInput = getByLabelText('URL')
  const startInput = getByLabelText('Start time')
  const stopInput = getByLabelText('End time')
  const saveVideoButton = getByText('Save Video')

  fireEvent.change(nameInput,  { target: { value: input.video.name } })
  fireEvent.change(URLInput, { target: { value: input.video.url } })
  fireEvent.change(startInput, { target: { value: input.video.start } })
  fireEvent.change(stopInput, { target: { value: input.video.stop } })
  fireEvent.click(saveVideoButton)

  await waitForElement(() => getByDisplayValue('Best Day Ever'))
})

it('should play a video', async () => {
  const input = {
    activeVideo: null,
    videos: [
      {
        id: 'VIDEO_001',
        name: 'video 001',
        url: 'mocktube.com/abc',
        start: '01:10',
        stop: '4:44'
      }
    ]
  }

  const {
    getByText,
    queryByText,
    queryAllByTestId
  } = render(<App activeVideo={input.activeVideo} videos={input.videos} />)

  expect(queryAllByTestId('video-list-item')).toHaveLength(1)

  const playVideoButton = getByText('Play')

  await fireEvent(playVideoButton, 'click')

  expect(queryByText('Play')).toBeNull()
  expect(queryByText('Stop')).toBeTruthy()
})

it('should stop playing videos', () => {
  const input = {
    activeVideo: {
      id: 'VIDEO_001',
      loop: true,
      tabId: 1,
      startSeconds: 70,
      stopSeconds: 284
    },
    videos: [
      {
        id: 'VIDEO_001',
        name: 'video 001',
        url: 'mocktube.com/abc',
        start: '01:10',
        stop: '4:44'
      }
    ]
  }

  const {
    getByText,
    queryByText,
    queryAllByTestId
  } = render(<App activeVideo={input.activeVideo} videos={input.videos} />)

  expect(queryAllByTestId('video-list-item')).toHaveLength(1)

  const stopVideoButton = getByText('Stop')

  fireEvent(stopVideoButton, 'click')

  expect(queryByText('Stop')).toBeNull()
  expect(queryByText('Play')).toBeTruthy()
})
