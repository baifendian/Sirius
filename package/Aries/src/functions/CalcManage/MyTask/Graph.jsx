import React from 'react'
import ReactDOM from 'react-dom'
import './Graph.less'
import Graph from 'public/Graph/Graph'
import { Tag } from 'antd'
import Button from 'bfd-ui/lib/Button'

import CMDR from '../CalcManageDataRequester/requester.js'

const TabGraph = React.createClass({
  getInitialState: function () {
    return {
      'data': {
        'nodes':[],
        'edges':[]
      }
    }
  },

  componentDidMount:function(){
    CMDR.getMytaskGraph( this,this.xhrCallback )
  },

  xhrCallback:(_this,executedData) => {
    _this.setState ( { 
      'data': executedData,
    })
  }, 
  render() {
    console.log( '///////////////' + this.props.height);
    if ( this.height !== this.props.height ){
      setTimeout( ()=>{
        let graphPanel = ReactDOM.findDOMNode( this.refs.Graph2Name )
        graphPanel.childNodes[0].style.height = (this.props.height - 50)  + 'px'
        //graphPanel.childNodes[0].style.background-image = 'public/background.png'
        // /graphPanel.childNodes[0].style. = '15px'
        

      } )
      this.height = this.props.height
    }
    /** 
    let data = {
      nodes: [
            {id: 1, label: 'taskf', color:'#97C2FC', shape: 'dot',shapeProperties: {},size: 15},
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
            {from: '1', to: 2},
            {from: '1', to: 3},
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
    };*/

    return (
      <div className='GraphName'>
        <div className='btn-name'>
          <Button className='btn-1' size='sm'>等待调度/未进入调度</Button>
          <Button className='btn-2' size='sm'>等待执行</Button>
          <Button className='btn-3' size='sm'>执行中</Button>
          <Button className='btn-4' size='sm'>执行完成(成功)</Button>
          <Button className='btn-5' size='sm'>执行完成(失败)</Button>
          <Button className='btn-6' size='sm'>任务停止中</Button>
          
        </div>
        <div ref='Graph2Name' className='Graph2Name'>
           <Graph graph={this.state.data}/>
        </div>
      </div>
    )
  }
})

export default TabGraph
