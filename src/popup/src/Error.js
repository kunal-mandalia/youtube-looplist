import React from 'react'
import './styles.css'

export function Error({ errors = [], removeError = () => { } }) {
  return errors.map(error => {
    return <div className='error-message' key={error.id}>
      {error.description}
      <button data-testid='error-message-close' className='error-message-close' onClick={() => { removeError(error.id) }}>Close</button>
    </div>
  })
}
