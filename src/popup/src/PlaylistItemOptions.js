import React from 'react'
import './styles.css'

export function PlaylistItemOptions ({ showOptions, toggleOptions, removeVideo }) {
  return (
    <div className='playlist-item-options'>
      {showOptions && (
        <div>
          <button onClick={removeVideo}>
            Remove
          </button>
      </div>
      )}
      <div
        data-testid='playlist-item-options-toggle'
        className={`toggle ${showOptions ? 'expanded' : 'collapsed'}`}
        onClick={toggleOptions}
      />
    </div>
  )
}
