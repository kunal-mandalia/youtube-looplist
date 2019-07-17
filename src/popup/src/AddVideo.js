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
    await this.props.onAddVideo(video)
    this.stopAddingVideo()
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

        <div className='form-two-column'>
          <label htmlFor='form-name'>Name</label>
          <input id='form-name' name='name' type='text' placeholder='Name of video' value={name} onChange={this.handleFormFieldChange} />
          <label htmlFor='form-url'>URL</label>
          <input id='form-url' name='url' type='text' placeholder='Link to YouTube Video' value={url} onChange={this.handleFormFieldChange} />
          <label htmlFor='form-startTime'>Start time</label>
          <input id='form-startTime' name='startTime' type='text' placeholder='(MM:SS) format' value={startTime} onChange={this.handleFormFieldChange} />
          <label htmlFor='form-stopTime'>End time</label>
          <input id='form-stopTime' name='stopTime' type='text' placeholder='(MM:SS) format' value={stopTime} onChange={this.handleFormFieldChange} />
          <div />
          <div className='action-buttons'>
            <button onClick={this.handleSubmitForm}>Save Video</button>
            <button onClick={this.stopAddingVideo}>Cancel</button>
          </div>
        </div>
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