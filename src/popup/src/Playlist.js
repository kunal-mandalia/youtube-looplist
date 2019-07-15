import React from 'react'
import './app.css'

function PlaylistItem({ video: { id, name }, playVideo, stopVideo, isActive }) {
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
    </div>
  )
}

export function Playlist(
  {
    activeVideo = {},
    videos = [],
    playVideo = () => { },
    stopVideo = () => { },
  }
) {
  return (
    <div className='playlist'>
      {videos.map(video => <PlaylistItem
        key={video.id}
        video={video}
        playVideo={() => { playVideo(video.id) }}
        stopVideo={stopVideo}
        isActive={activeVideo && (video.id === activeVideo.id)}
      />)}
    </div>
  )
}