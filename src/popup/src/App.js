import React from 'react';
import './styles.css';
import { logger } from 'util/logger'
import popup from './popup.js'
import { AddVideo } from './AddVideo'
import { Playlist } from './Playlist'
import { Error } from './Error'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isChromeAvailable: false
    }
  }
  
  componentDidMount() {
    this.fetchStorage()
  }

  fetchStorage = async () => {
    const storage = await popup.getStorage()
    this.setState({
      isChromeAvailable: true,
      ...storage
    })
  }

  syncState = async () => {
    const storage = await popup.getStorage()
    this.setState({
      ...storage
    })
  }

  handleAddVideo = async (video) => {
    await popup.addVideo(video)
    await this.syncState()
  }

  handlePlayVideo = async (id) => {
    await popup.playVideo({ id, loop: true })
    await this.syncState()
  }

  handleStopVideo = async () => {
    await popup.stopVideo()
    await this.syncState()
  }

  handleRemoveVideo = async (id) => {
    const { activeVideo } = this.state
    if (activeVideo && activeVideo.id === id) {
      await popup.stopVideo()
    }
    await popup.removeVideo(id)
    await this.syncState()
  }

  handleRemoveError = async (id) => {
    await popup.removeError(id)
    await this.syncState()
  }

  render() {
    logger.info(`App render`)
    const { activeVideo, videos, errors } = this.state
    return (
      <div className="app">
        <Error errors={errors} removeError={this.handleRemoveError} />
        <AddVideo onAddVideo={this.handleAddVideo} />
        <Playlist
          activeVideo={activeVideo}
          videos={videos}
          playVideo={this.handlePlayVideo}
          stopVideo={this.handleStopVideo}
          removeVideo={this.handleRemoveVideo}
        />
      </div>
    );
  }
}

export default App;
