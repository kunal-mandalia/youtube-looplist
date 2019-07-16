import React from 'react';
import { render, fireEvent, waitForElement, wait, cleanup } from '@testing-library/react';
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

afterEach(() => {
  cleanup()
})

async function addVideo(video, { getByText, getByLabelText }) {
  const addVideoButton = getByText('Add Video')
  fireEvent.click(addVideoButton)

  const nameInput = getByLabelText('Name')
  const URLInput = getByLabelText('URL')
  const startInput = getByLabelText('Start time')
  const stopInput = getByLabelText('End time')
  const saveVideoButton = getByText('Save Video')

  fireEvent.change(nameInput,  { target: { value: video.name } })
  fireEvent.change(URLInput, { target: { value: video.url } })
  fireEvent.change(startInput, { target: { value: video.start } })
  fireEvent.change(stopInput, { target: { value: video.stop } })
  fireEvent.click(saveVideoButton)
  await waitForElement(() => getByText('Add Video'))
}

it('should render no saved videos initially', async () => {
  const { getByTestId, queryAllByTestId } = render(<App />)

  await waitForElement(() => getByTestId('playlist'))
  expect(queryAllByTestId('playlist-item')).toHaveLength(0)
})

it('should add a new video', async () => {
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
    queryAllByTestId
  } = render(<App />)

  await addVideo(input.video, { getByText, getByLabelText })
  expect(queryAllByTestId('playlist-item')).toHaveLength(1)
  getByText('Best Day Ever')
})

it('should play / stop a video', async () => {
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
    queryAllByTestId
  } = render(<App />)

  await addVideo(input.video, { getByText, getByLabelText })

  expect(queryAllByTestId('playlist-item')).toHaveLength(1)

  const playButton = getByText('Play')
  fireEvent.click(playButton)

  await waitForElement(() => getByText('Stop'))
  const stopButton = getByText('Stop')
  fireEvent.click(stopButton)

  await waitForElement(() => getByText('Play'))
})

it('should remove video', async () => {
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
    queryAllByTestId,
    getByTestId,
    queryByText
  } = render(<App />)

  await addVideo(input.video, { getByText, getByLabelText })
  expect(queryAllByTestId('playlist-item')).toHaveLength(1)

  const optionsToggle = getByTestId('playlist-item-options-toggle')
  fireEvent.click(optionsToggle)

  await waitForElement(() => getByText('Remove'))
  const removeVideoButton = getByText('Remove')
  fireEvent.click(removeVideoButton)

  await wait(() => expect(queryByText('Remove')).toEqual(null))

  expect(queryAllByTestId('playlist-item')).toHaveLength(0)
})
