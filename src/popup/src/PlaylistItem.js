import React from 'react'
import { PlaylistItemOptions } from './PlaylistItemOptions'
import './app.css'

export function PlaylistItem({
  video: { id, name },
  playVideo,
  stopVideo,
  isActive,
  removeVideo
}) {
  return (
    <div
      key={id}
      data-testid='playlist-item'
      className={`playlist-item ${isActive ? 'active-video' : 'inactive-video'}`}
    >
      {isActive ? <button onClick={stopVideo}>Stop</button> : <button onClick={playVideo}>Play</button>}
      <div className='playlist-item-details'>
        {name}
      </div>
      <PlaylistItemOptions removeVideo={removeVideo} />
    </div>
  )
}
