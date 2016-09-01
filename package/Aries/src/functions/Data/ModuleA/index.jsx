import React from 'react'
import Task from 'public/Task'
import './index.less'

export default React.createClass({
  render() {
    return (
      <div className="function-data-moduleA">
        <h1>ModuleA</h1>
        <Task />
      </div>
    )
  }
})