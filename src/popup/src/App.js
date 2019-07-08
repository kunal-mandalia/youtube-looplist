import React from 'react';
import { logger } from 'util/logger'
import './App.css';
import popup from './popup.js'

class App extends React.Component {
  constructor() {
    super()
    this.state = {
      isChromeAvailable: false
    }
  }
  componentDidMount() {
    if (window.chrome) {
      console.log(window.chrome)
      this.fetchStorage()
    }
  }

  fetchStorage = async () => {
    logger.info(`fetchStorage...`)
    const storage = await popup.getStorage()
    logger.info(`storage`, storage)
    this.setState({
      isChromeAvailable: true,
      ...storage
    })
  }

  render() {
    logger.info(`App this`, this)
    return (
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
        </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
        </a>
          <hr />
          <button onClick={() => { popup.playVideo({ id: 'VIDEO_0001', loop: true }) }}>Play</button><br />
          <button onClick={() => { popup.stopVideo() }}>Stop</button>
        </header>
      </div>
    );
  }
}

export default App;
