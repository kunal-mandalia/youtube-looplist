import React from 'react'
import { PlaylistItem } from './PlaylistItem'
import './styles.css'

export function Playlist(
  {
    activeVideo = {},
    videos = [],
    playVideo = () => {},
    stopVideo = () => {},
    removeVideo = () => {}
  }
) {
  return (
    <div data-testid='playlist' className='playlist'>
      {videos.map(video => <PlaylistItem
        key={video.id}
        video={video}
        playVideo={() => { playVideo(video.id) }}
        stopVideo={stopVideo}
        isActive={activeVideo && (video.id === activeVideo.id)}
        removeVideo={() => { removeVideo(video.id) }}
      />)}
    </div>
  )
}