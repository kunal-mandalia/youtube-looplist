import React from 'react';
import './app.css';
import { logger } from 'util/logger'
import popup from './popup.js'
import { AddVideo } from './AddVideo'
import { Playlist } from './Playlist'

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
    logger.info('synced state', this.state)
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
    await popup.removeVideo(id)
    await this.syncState()
  }

  render() {
    logger.info(`App render`)
    const { activeVideo, videos } = this.state
    return (
      <div className="app">
        <AddVideo onAddVideo={this.handleAddVideo}/>
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
