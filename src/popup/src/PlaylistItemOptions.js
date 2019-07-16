import React from 'react'
import './styles.css'

export class PlaylistItemOptions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isExpanded: false
    }
  }

  toggleOptions = () => {
    this.setState(prevState => ({
      isExpanded: !prevState.isExpanded
    }))
  }

  renderOptions() {
    return <div>
      <button onClick={this.removeVideo}>
        Remove
      </button>
    </div>
  }

  removeVideo = async () => {
    await this.props.removeVideo()
  }

  render() {
    const { isExpanded } = this.state
    return (
      <div className='playlist-item-options'>
        {isExpanded && this.renderOptions()}
        <div
          data-testid='playlist-item-options-toggle'
          className={`${isExpanded ? 'expanded' : 'colllapsed'}`}
          onClick={this.toggleOptions}
        >
          Options
        </div>
      </div>
    )
  }
}
