import React from 'react'
import DynamicTable from '../DynamicTable'
import './index.less'

var GroupBoxWithDynamicTable = React.createClass({
  render:function(){
    return (
      <fieldset className="GroupBoxWithDynamicTableClass">
        <legend>{this.props.groupBoxText}</legend>
        <DynamicTable dynamicTableTextArray={this.props.dynamicTableTextArray}/>
      </fieldset>
    )
  }
})

export default GroupBoxWithDynamicTable