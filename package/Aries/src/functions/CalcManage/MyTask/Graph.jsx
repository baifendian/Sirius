import React from 'react'
import './Graph.less'
import Graph from 'public/Graph'
import { Tag } from 'antd'

import CMDR from '../CalcManageDataRequester/requester.js'

const TabGraph = React.createClass({
  getInitialState: function () {
    setTimeout( () => { CMDR.getMytaskList( this,this.xhrCallback ) }, 0);
    this.oriData = []

  xhrCallback:(_this,executedData) => {
    _this.setState ( { 
      'data': {
        "totalList": executedData,
        "totalPageNum":executedData.length
      }
    })
    _this.oriData = executedData
  }, 
render() {
  /**var data = {
  nodes: [
      {id: 1, label: 'task 1', color:'#97C2FC'},
      {id: 2, label: 'task 2', color:'#6E6EFD'},
      {id: 3, label: 'task 3', color:'#C2FABC'},
      {id: 4, label: 'task 4', color:'#C2FABC'},
      {id: 5, label: 'task 5', color:'#C2FABC'}, 
      {id: 6, label: 'task 6', color:'#C2FABC'},
      {id: 7, label: 'task 7', color:'#C2FABC'},
      {id: 8, label: 'task 8', color:'#FF0000'},
      {id: 9, label: 'task 9', color:'#9D9D9D'},
      {id: 10, label: 'task 10', color:'#FFA807'}
    ],
  edges: [
      {from: 1, to: 2},
      {from: 1, to: 3},
      {from: 1, to: 4},
      {from: 2, to: 5},
      {from: 3, to: 6},
      {from: 4, to: 7},
      {from: 6, to: 10},
      {from: 8, to: 9},
      {from: 9, to: 10},
      {from: 3, to: 8},
      {from: 3, to: 9},
    ]
};**/

    return (
      <div className='GraphName'>
         <Tag color="blue">执行中</Tag>
         <Tag color="green">执行完成(成功)</Tag>
         <Tag color="yellow">任务停止中</Tag>
         <Tag color="red">执行完成(失败)</Tag>
         <Tag color='black'>等待执行\未进入调度</Tag>
         <Graph graph={this.state.data}/>
      </div>
    )
  }
})

export default TabGraph
