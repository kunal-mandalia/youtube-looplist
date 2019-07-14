import background from './background.js'

const initialState = {
  videos: [
    {
      id: 1,
      name: 'Best Day Ever',
      url: 'https://www.youtube.com/watch?v=AbV-Q6tz4B8',
      startTime: '01:15',
      stopTime: '03:59'
    },
    {
      id: 2,
      name: 'Maahi Ve Acoustic',
      url: 'https://www.youtube.com/watch?v=Hc7BjYmn9z0',
      startTime: '03:55',
      stopTime: '06:09'
    }
  ]
} 

background.main(initialState)