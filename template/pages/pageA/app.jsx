import React, { Component } from 'react'
import base from './base.css'
class App extends Component {
  render() {
    return (
      <div className={base.container}>
        <h1>This is pageA.</h1>
        <a href="/pageA">pageA</a>
        <a href="/pageB">pageB</a>
      </div>
    )
  }
}

export default App;
