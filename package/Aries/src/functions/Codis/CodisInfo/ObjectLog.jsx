import React from 'react'
import './index.less'

const ObjectLog =  React.createClass({
    render: function () {
        return (
            <div>
            {this.props.log}
            </div>
        )
    }
})

export default ObjectLog