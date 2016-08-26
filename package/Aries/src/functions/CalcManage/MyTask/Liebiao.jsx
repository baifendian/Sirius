import React from 'react'
import ReactDOM from 'react-dom'

import DataTable from 'bfd-ui/lib/DataTable'
import Button from 'bfd-ui/lib/Button'
import message from 'bfd-ui/lib/message'

import Input from 'bfd-ui/lib/Input'
import { Select, Option } from 'bfd-ui/lib/Select'
import DatePicker from 'bfd-ui/lib/DatePicker'

import CMDR from '../CalcManageDataRequester/requester.js'
import Toolkit from 'public/Toolkit/index.js'

import './Liebiao.less'
import './index.less'


const TabLiebiao = React.createClass({
	getInitialState: function () {
    this.userData = {}      // 存储一些自己要使用的信息
    let state_dict = {
      // 表格信息
      column: [{ title:'id',       key:'id',            order:false },
               { title:'JobName',  key:'job_name',      order:false }, 
               { title:'TaskName', key:'task_name',          order:false }, 
               { title:'准备时间',  key:'ready_time',    order:false }, 
               { title:'开始时间',  key:'running_time',  order:false },
               { title:'完成时间',  key:'leave_time',    order:false },
               { title:'执行状态',  key:'status',        order:false },
               { title:'执行结果',  key:'result',        order:false }],
      showPage:'false',
      data:{"totalList": [],"totalPageNum":0},

      highlightRecords:[],
      lastNewRecordGUID:'',
      loadNewRecordsButtonDisplay:false     // false表示隐藏，true表示显示
    }
    return state_dict
  },

  componentDidMount:function(){
    this.resizeThWidth()

    this.installTbodyScrollListener()
    this.initDisplay()
    this.firstTimeGetOldRecords()
  },

  componentDidUpdate:function(){
    this.resizeTdWidth()

    this.highlightNewRecordLines()
  },

  initDisplay:function(){
    this.stopCheckHasNewRecordInterval()
    this.userData = {}
    this.setState({
      data:{"totalList": [],"totalPageNum":0},
      highlightRecords:[],
      lastNewRecordGUID:'',
      loadNewRecordsButtonDisplay:false
    })    
  },

  installTbodyScrollListener:function(  ){
    let tbody = this.getRealTimeTheadAndTbodyObj()['tbody']
    tbody.onscroll = () => {
      let tbody = this.getRealTimeTheadAndTbodyObj()['tbody']
      
      // 当滚动条快要滚动到底部的时候，请求数据
      if (tbody.scrollHeight - (tbody.scrollTop+tbody.clientHeight) <= 20){
        if ( this.userData['scrollHeight'] != tbody.scrollHeight ){
          this.userData['scrollHeight'] = tbody.scrollHeight
          this.getMoreOldRecords()
        }
      }

    }
  },


  getRealTimeTheadAndTbodyObj:function(){
    let dataTableNode = ReactDOM.findDOMNode( this.refs.DataTable )
    let thead = dataTableNode.childNodes[1].childNodes[0]
    let tbody = dataTableNode.childNodes[1].childNodes[1]
    return { 'thead':thead,'tbody':tbody }
  },

  // 获取当前最新（ID号最大）、最旧（ID号最小）的ID号。如果当前前端暂时没有请求到任何数据，则返回 -1
  getNewestID(){  return (this.state.data['totalList'].length == 0) ? -1 : this.state.data['totalList'][0]['id']  },
  getOldestID(){  return (this.state.data['totalList'].length == 0) ? -1 : this.state.data['totalList'][this.state.data['totalList'].length-1].id  },
  
  showLoadNewRecordsButton(){ this.setState({ 'loadNewRecordsButtonDisplay':true  }) },
  hideLoadNewRecordsButton(){ this.setState({ 'loadNewRecordsButtonDisplay':false }) },
  
  // 将滚动条置于顶端  
  tbodyScrollToHead(){  this.getRealTimeTheadAndTbodyObj()['tbody'].scrollTop = 0  },

  // 开启、关闭定时获取是否存在更新的记录
  stopCheckHasNewRecordInterval(){  
    this.userData['checkHasNewRecordInterval'] && clearInterval( this.userData['checkHasNewRecordInterval'] )
    this.userData['checkHasNewRecordInterval'] = undefined
  },
  startCheckHasNewRecordInterval(){ 
    this.userData['checkHasNewRecordInterval'] = setInterval( ()=>{
      this.startCheckHasNewRecords()
    },5000 )
  },
  


  // 获取当前的筛选条件
  queryKeywords(){
    return {}
  },

  // 第一次获取现有记录，并启动定时器（获取新的记录）
  firstTimeGetOldRecords:function(){
    this.stopCheckHasNewRecordInterval()
    this.tbodyScrollToHead()

    CMDR.getMyTaskOldRecords( -1,30,this.queryKeywords(),( executedData ) => { 
      let data = executedData['records']
      this.setState ( { 
        "data": {
          "totalList": data,
          "totalPageNum":data.length
        }
      })
      this.startCheckHasNewRecordInterval()
    } )
  },

  getMoreOldRecords:function(){
    CMDR.getMyTaskOldRecords( this.getOldestID(),30,this.queryKeywords(),( executedData ) => { 
      let data = this.state.data['totalList'].concat( executedData['records'] )
      this.setState ( { 
        "data": {
          "totalList": data,
          "totalPageNum":data.length
        }
      })
    })
  },

  startCheckHasNewRecords:function(){
    CMDR.checkMyTaskHasNewRecords( this.getNewestID(),this.queryKeywords(),( executedData )=>{
      if ( executedData['hasnew'] !== 1 )
        return
      this.showLoadNewRecordsButton()
    })
  },

  loadNewRecords:function(){
    this.stopCheckHasNewRecordInterval()
    this.hideLoadNewRecordsButton()
    CMDR.getMyTaskNewRecords( this.getNewestID(),this.queryKeywords(),( executedData ) => {
      let newRecords = executedData['records']
      let data = newRecords.concat( this.state.data['totalList'] )
      this.setState ( { 
        data: {
          totalList: data,
          totalPageNum:data.length
        },
        highlightRecords:newRecords,
        lastNewRecordGUID:Toolkit.generateGUID()
      })
    })
    this.startCheckHasNewRecordInterval()
  },

  onLoadNewRecordButtonClicked:function(){
    this.loadNewRecords()
  },

  onSearchButtonClicked:function(){
    this.initDisplay()
    this.firstTimeGetOldRecords()
    console.log( 'SearchButtonClicked' )
  },


  resizeThWidth:function(){
    let thead = this.getRealTimeTheadAndTbodyObj()['thead']
    let tr = thead.childNodes[0]
    for( let j = 0 ; j < tr.childNodes.length ; j ++ ){
      tr.childNodes[j].className += ' width_' + j
    }
  },

  resizeTdWidth:function(){
    let tbody = this.getRealTimeTheadAndTbodyObj()['tbody']
    for ( let i = 0 ; i < tbody.childNodes.length ; i ++ ){
      let tr = tbody.childNodes[i]

      if (tr.childNodes.length !== this.state.column.length)
        break

      for( let j = 0 ; j < tr.childNodes.length ; j ++ ){
        tr.childNodes[j].className = 'width_' + j
      }
    }
  },

  highlightNewRecordLines:function(){
    if ( this.userData['lastExecutedNewRecordGUID'] === this.state.lastNewRecordGUID ){
      return
    }
    this.userData['lastExecutedNewRecordGUID'] = this.state.lastNewRecordGUID

    let tbody = this.getRealTimeTheadAndTbodyObj()['tbody']
    for ( let i = 0 ; i < this.state.highlightRecords.length ; i ++ ){
      tbody.childNodes[i].className = 'highlightLine'
    }
  },

  render: function() {
    
    // 这里不知道为啥没生效
    if ( this.height !== this.props.height ){
      setTimeout( ()=>{
        let tablePanel = ReactDOM.findDOMNode( this.refs.DataTableDiv )
        tablePanel.style.height = this.props.height - 20 + 'px'
      } )
      this.height = this.props.height
    }

    let loadNewRecordsButtonStyle = { display: this.state.loadNewRecordsButtonDisplay ? 'block' : 'none' }

    return  (
      <div className="LiebiaoRootDiv">

        <Button className="SearchButton" onClick={this.onSearchButtonClicked}> 搜索 </Button>
        <table className="SearchConditionTable">
          <tbody>
            <tr>
              <td>任务名称：</td>
              <td><Input placeholder="正常" className="SearchItemControl" /></td>
              
              <td>脚本类型：</td>
              <td>
                <Select defaultValue="ALLSHELLTYPE"  className="SearchItemControl" >
                  <Option value="ALLSHELLTYPE">不限制脚本类型</Option>
                  <Option value="HIVE">HIVE</Option>
                  <Option value="SQOOP">SQOOP</Option>
                  <Option value="SHELL">SHELL</Option>
                  <Option value="SPARK">SPARK</Option>                
                </Select>
              </td>

              <td>执行结果：</td>
              <td>
                <Select defaultValue="ALLEXECUTEDRESULT"  className="SearchItemControl" >
                  <Option value="ALLEXECUTEDRESULT">不限制执行结果</Option>
                  <Option value="INIT">初始</Option>
                  <Option value="SUCCESS">成功</Option>
                  <Option value="FAILURE">失败</Option>
                </Select>
              </td>
              <td>开始日期：</td>
              <td><DatePicker className="SearchItemControl"/></td>

              <td>结束日期：</td>
              <td><DatePicker className="SearchItemControl"/></td>
            </tr>
          </tbody>
        </table>

        <Button className="LoadNewRecordsButton" style={loadNewRecordsButtonStyle} onClick={this.onLoadNewRecordButtonClicked}> 发现新的数据，是否加载？ </Button>
        <div className='DataTableDiv' ref='DataTableDiv'>
          <DataTable ref="DataTable" 
            data={this.state.data} 
            showPage={this.state.showPage} 
            column= { this.state.column }  />
          </div>
      </div>
    )
  }
});
export default TabLiebiao