import React from 'react'
import './index.less'

export default React.createClass({
  render() {
    return (
      <div className="public-task">
        <h3>业务逻辑中复用的组件</h3>
        <p>为了防止 css 冲突，className 以 `public-` 开头</p>
      </div>
    )
  }
})