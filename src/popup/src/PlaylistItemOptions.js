import React from 'react'
import './styles.css'

const KEY_ENTER = 13
const KEY_SPACE = 32

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
        tabIndex='0'
        role='button'
        aria-pressed={showOptions}
        data-testid='playlist-item-options-toggle'
        className={`toggle ${showOptions ? 'expanded' : 'collapsed'}`}
        onClick={toggleOptions}
        onKeyDown={event => {
          if (event.keyCode === KEY_ENTER || event.keyCode === KEY_SPACE) {
            toggleOptions()
          }
        }}
      />
    </div>
  )
}
