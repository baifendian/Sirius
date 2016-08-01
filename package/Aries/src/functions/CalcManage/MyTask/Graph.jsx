import React from 'react'
import './index.less'
import './Graph.less'
import Graph from 'public/Graph'

const TabGraph = React.createClass({

render() {
  var data = {
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
};

    return (
      <div className='GraphName'>
         <p>BDMS任务运行网络图</p>
         <Graph graph={data}/>
      </div>
    )
  }
})

export default TabGraph
