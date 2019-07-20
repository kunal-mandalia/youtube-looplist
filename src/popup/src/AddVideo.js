import React from 'react'
import { logger } from 'util/logger';
import './styles.css'

const stubs = {
  local: {
    name: 'Local',
    url: 'http://localhost:5000/?watch=true',
    startTime: '00:02',
    stopTime: '00:06'
  },
  web: {
    name: 'Flute',
    url: 'https://www.youtube.com/watch?v=Hc7BjYmn9z0',
    startTime: '02:24',
    stopTime: '02:30'
  }
}

class AddVideo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showForm: false,
      form: {
        ...stubs.local
      }
    }
    this.form = React.createRef();
  }

  startAddingVideo = () => {
    this.setState({ showForm: true })
  }

  stopAddingVideo = () => {
    this.setState({ showForm: false })
  }

  handleFormFieldChange = (event) => {
    logger.info(`handleFormFieldChange`, event)
    const updatedForm = {
      ...this.state.form,
      [event.target.name]: event.target.value
    }
    this.setState({ form: updatedForm })
  }

  handleSubmitForm = async (event) => {
    event.preventDefault()
    const { form: video } = this.state
    const isValidated = this.form.current.checkValidity()
    this.form.current.reportValidity()
    if (isValidated) {
      await this.props.onAddVideo(video)
      this.stopAddingVideo()
    }
  }

  renderAddVideoButton = () => {
    return <div className='add-video-button-wrapper'>
      <button onClick={this.startAddingVideo}>Add Video</button>
      </div>
  }

  renderAddVideoForm = () => {
    const { name, url, startTime, stopTime } = this.state.form
    return (
      <div className='form-add-video'>

        <form ref={this.form} className='form-two-column' onSubmit={this.handleSubmitForm}>
          <label htmlFor='form-name'>Name</label>
          <input
            id='form-name'
            required
            aria-required='true'
            name='name'
            type='text'
            placeholder='Name of video'
            value={name}
            onChange={this.handleFormFieldChange}
          />
          <label htmlFor='form-url'>URL</label>
          <input
            id='form-url'
            required
            aria-required='true'
            name='url'
            type='URL'
            placeholder='Link to YouTube Video'
            value={url}
            onChange={this.handleFormFieldChange}
          />
          <label htmlFor='form-startTime'>Start time</label>
          <input
            id='form-startTime'
            required
            pattern='([0-5]?\d):([0-5]?\d)'
            aria-required='true'
            name='startTime'
            type='text'
            placeholder='(MM:SS) format'
            value={startTime}
            onChange={this.handleFormFieldChange}
          />
          <label htmlFor='form-stopTime'>End time</label>
          <input
            id='form-stopTime'
            required
            pattern='([0-5]?\d):([0-5]?\d)'
            aria-required='true'
            name='stopTime'
            type='text'
            placeholder='(MM:SS) format'
            value={stopTime}
            onChange={this.handleFormFieldChange}
          />
          <div />
          <div className='action-buttons'>
            <button type='submit'>Save Video</button>
            <button onClick={this.stopAddingVideo}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  render() {
    const { showForm } = this.state
    return (
      <div className='component-add-video'>
        {showForm ? this.renderAddVideoForm() : this.renderAddVideoButton()}
      </div>
    )
  }
}

export {
  AddVideo
}