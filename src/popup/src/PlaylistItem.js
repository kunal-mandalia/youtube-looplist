import React from 'react'
import { PlaylistItemOptions } from './PlaylistItemOptions'
import './styles.css'

export class PlaylistItem extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showOptions: false
    }
  }

  toggleOptions = () => {
    this.setState(prevState => ({
      showOptions: !prevState.showOptions
    }))
  }

  render() {
    const { showOptions } = this.state
    const { video: { id, name }, isActive, playVideo, stopVideo, removeVideo } = this.props
    return (
      <div
        key={id}
        data-testid='playlist-item'
        className={`playlist-item ${isActive ? 'active-video' : 'inactive-video'}`}
      >
        {!showOptions && (isActive ? <button onClick={stopVideo}>Stop</button> : <button onClick={playVideo}>Play</button>)}
        <div className='playlist-item-details'>
          {name}
        </div>
        <PlaylistItemOptions
          showOptions={showOptions}
          toggleOptions={this.toggleOptions}
          removeVideo={removeVideo}
        />
      </div>
    )
  }
}
