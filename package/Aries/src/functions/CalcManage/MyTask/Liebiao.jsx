import React from 'react'
import ReactDOM from 'react-dom'

import DataTable from 'bfd-ui/lib/DataTable'
import Button from 'bfd-ui/lib/Button'
import message from 'bfd-ui/lib/message'

import Input from 'bfd-ui/lib/Input'
import { Select, Option } from 'bfd-ui/lib/Select'
import { DateRange } from 'bfd-ui/lib/DatePicker'

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
               { title:'TaskName', key:'task_name',     order:false }, 
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
    this.installTbodyScrollListener()

    // 汇总搜索条件（由于页面刚刚刷新完毕时，this.userData中未保存任何搜索条件，因此得到的都是初始值）
    this.querySearchConditions()
    this.firstTimeGetOldRecords()
  },

  componentDidUpdate:function(){
    this.highlightNewRecordLines()
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

  querySearchConditions:function(){
    let searchConditions = {
      taskname:this.userData['curTaskName'] ? this.userData['curTaskName'] : '',
      shelltype:this.userData['curShellType'] ? this.userData['curShellType'] : 'ALL',
      executeresult:this.userData['curExecutedResult'] ? this.userData['curExecutedResult'] : 'ALL',
      startdate:this.userData['curStartDate'] ? this.userData['curStartDate'] : Toolkit.generateTimeStrBySeconds(0),
      enddate:this.userData['curEndDate'] ? this.userData['curEndDate'] : Toolkit.generateTimeStrBySeconds(-1).split('T')[0] + 'T23:59:59'
    }
    this.userData['curSearchCondition'] = searchConditions
    return searchConditions
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
  
  markControlChangedStyle( node,changed ){
    if ( changed ){
      node.style.color = '#333333';
      node.style.backgroundColor = '#BBDEFB';
    } else {
      node.style.color = '';
      node.style.backgroundColor = '';
    }
  },

  // 在点击查询按钮之前、改变查询条件之后，需要改变控件的样式以提醒用户
  markTaskNameControlState( changed ){
    //（由于Input组件设置ref之后，通过ReactDOM.findDOMNode找不到相应的节点，因此这里使用 id 来获取该节点的文本内容）
    let node = document.getElementById('TaskNameInputControl')
    this.markControlChangedStyle( node,changed )
  },
  markShellTypeControlState( changed ){
    let node = ReactDOM.findDOMNode( this.refs.ShellTypeSelect ).childNodes[0].childNodes[0]
    this.markControlChangedStyle( node,changed )
  },
  markExecuteResultControlState( changed ){
    let node = ReactDOM.findDOMNode( this.refs.ExecuteResultSelect ).childNodes[0].childNodes[0]
    this.markControlChangedStyle( node,changed )
  },
  markDataRangeControlState( changed ){
    let nodes = ReactDOM.findDOMNode( this.refs.DataRangeControl ).getElementsByTagName('input')
    for ( let i = 0 ; i < nodes.length ; i ++ ){
      this.markControlChangedStyle( nodes[i],changed )
    }
  },
  
  // 将滚动条置于顶端  
  tbodyScrollToHead(){  this.getRealTimeTheadAndTbodyObj()['tbody'].scrollTop = 0  },

  // 开启、关闭定时获取是否存在更新的记录
  stopCheckHasNewRecordTimeout(){  
    this.userData['checkHasNewRecordTimeoutObj'] && clearTimeout( this.userData['checkHasNewRecordTimeoutObj'] )
    this.userData['checkHasNewRecordTimeoutObj'] = undefined
  },
  startCheckHasNewRecordTimeout(){ 
    // 如果用户配置的时间范围的结束时间是当天，则需要启动这个轮询；但如果不是，则实际上没有启动轮询的必要
    if ( (new Date()).getTime() > (new Date(this.queryKeywords()['enddate'])).getTime() ){
      return
    }
    this.userData['checkHasNewRecordTimeoutObj'] = setTimeout( ()=>{
      this.checkHasNewRecords()
    },5000 )
  },
  
  // 获取当前的筛选条件
  queryKeywords(){
    if ( this.userData['curSearchCondition'] === undefined ){
      this.userData['curSearchCondition'] = {
        taskname:'',
        shelltype:'ALL',
        executeresult:'ALL',
        startdate:Toolkit.generateTimeStrBySeconds(0),
        enddate:Toolkit.generateTimeStrBySeconds(-1)
      }
    } 
    return this.userData['curSearchCondition']
  },

  // 第一次获取现有记录，并启动定时器（获取新的记录）
  firstTimeGetOldRecords:function(){
    this.stopCheckHasNewRecordTimeout()
    this.tbodyScrollToHead()

    CMDR.getMyTaskOldRecords( -1,50,this.queryKeywords(),( executedData ) => { 
      let data = executedData['records']
      this.setState ( { 
        "data": {
          "totalList": data,
          "totalPageNum":data.length
        }
      })
      this.startCheckHasNewRecordTimeout()
    } )
  },

  getMoreOldRecords:function(){
    CMDR.getMyTaskOldRecords( this.getOldestID(),50,this.queryKeywords(),( executedData ) => { 
      let data = this.state.data['totalList'].concat( executedData['records'] )
      this.setState ( { 
        "data": {
          "totalList": data,
          "totalPageNum":data.length
        }
      })
    })
  },

  checkHasNewRecords:function(){
    CMDR.checkMyTaskHasNewRecords( this.getNewestID(),this.queryKeywords(),( executedData )=>{
      if ( executedData['hasnew'] === 1 ){
        this.showLoadNewRecordsButton()
      } else {
        this.startCheckHasNewRecordTimeout()
      }
    })
  },

  loadNewRecords:function(){
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
      this.startCheckHasNewRecordTimeout()
    })
  },

  onLoadNewRecordButtonClicked:function(){
    this.loadNewRecords()
  },

  onSearchButtonClicked:function(){
    this.markTaskNameControlState( false )
    this.markShellTypeControlState( false )
    this.markExecuteResultControlState( false )
    this.markDataRangeControlState( false )

    // 清除原来的数据
    this.stopCheckHasNewRecordTimeout()
    this.userData['scrollHeight'] = undefined
    this.userData['lastExecutedNewRecordGUID'] = undefined
    this.setState({
      data:{"totalList": [],"totalPageNum":0},
      highlightRecords:[],
      lastNewRecordGUID:'',
      loadNewRecordsButtonDisplay:false
    })

    // 汇总查询条件
    this.querySearchConditions()

    // 重新请求数据
    this.firstTimeGetOldRecords()
  },

  onTaskNameChanged( e ){
    this.userData['curTaskName'] = e.target.value
    this.markTaskNameControlState( true )
  },

  onShellTypeChanged( value ){
    this.userData['curShellType'] = value
    this.markShellTypeControlState( true )
  },

  onExecutedResultChanged( value ){
    this.userData['curExecutedResult'] = value
    this.markExecuteResultControlState( true )
  },

  onDateRangeChanged( startDate,endDate ){
    if (startDate){
      this.userData['curStartDate'] = Toolkit.generateTimeStrBySeconds( startDate ).split('T')[0] + 'T00:00:00'
    } else {
      this.userData['curStartDate'] = Toolkit.generateTimeStrBySeconds( 0 )
    }
    if ( endDate ){
      this.userData['curEndDate'] = Toolkit.generateTimeStrBySeconds( endDate ).split('T')[0] + 'T23:59:59'
    } else {
      this.userData['curEndDate'] = Toolkit.generateTimeStrBySeconds( -1 ).split('T')[0] + 'T23:59:59'
    }

    this.markDataRangeControlState( true )
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

  // 根据父页面传入的height计算出来本页面的table的tbody应有的height
  calcTbodyHeight:function(){
    let tObj = this.getRealTimeTheadAndTbodyObj()
    let tbody = tObj['tbody']
    let thead = tObj['thead']

    let height = this.props.height
        
    // 减掉在父页面的 .bfd-tabs .tab-panel 的 padding-top: 10px
    height -= 10

    height -= ReactDOM.findDOMNode( this.refs.SearchConditionTableFatherDiv ).clientHeight

    // 去掉 LoadNewRecordsButtonFatherDiv 的高度以及div.LiebiaoRootDiv .LoadNewRecordsButtonFatherDiv的padding-top
    height -= ReactDOM.findDOMNode( this.refs.LoadNewRecordsButtonFatherDiv ).clientHeight + 5 

    // 去掉 div.LiebiaoRootDiv > div.DataTableDiv 样式的padding、border
    height -= ( 13 + 10 + 1*2 )

    // 减掉thead的高度，以及原生table样式的margin-bottom（20px）、为thead设置的3px的border
    height -= thead.clientHeight + 20 + 3

    tbody.style.height = height + 'px'
  },

  render: function() {
    if ( this.height !== this.props.height ){
      this.height = this.props.height
      setTimeout( ()=>{  this.calcTbodyHeight()  } )
    }

    return  (
      <div className="LiebiaoRootDiv">
        <div ref="SearchConditionTableFatherDiv" className="SearchConditionTableFatherDiv">
          <table className="SearchConditionTable">
            <tbody>
              <tr>
                <td>任务名称：</td>
                <td><Input id="TaskNameInputControl" onChange={this.onTaskNameChanged} /></td>
                
                <td>脚本类型：</td>
                <td>
                  <Select ref="ShellTypeSelect" defaultValue="ALL" onChange={this.onShellTypeChanged}>
                    <Option value="ALL">不限制脚本类型</Option>
                    <Option value="HIVE">HIVE</Option>
                    <Option value="SQOOP">SQOOP</Option>
                    <Option value="SHELL">SHELL</Option>
                    <Option value="SPARK">SPARK</Option>                
                  </Select>
                </td>

                <td>执行结果：</td>
                <td>
                  <Select ref="ExecuteResultSelect" defaultValue="ALL" onChange={this.onExecutedResultChanged}>
                    <Option value="ALL">不限制执行结果</Option>
                    <Option value="INIT">初始</Option>
                    <Option value="SUCCESS">成功</Option>
                    <Option value="FAILURE">失败</Option>
                  </Select>
                </td>
                <td>时间范围：</td>
                <td><DateRange ref="DataRangeControl" onSelect={this.onDateRangeChanged} /></td>

                <td><Button className="SearchButton" onClick={this.onSearchButtonClicked}> 查询 </Button></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div ref="LoadNewRecordsButtonFatherDiv" className="LoadNewRecordsButtonFatherDiv" >
          <Button className={'LoadNewRecordsButton' + (this.state.loadNewRecordsButtonDisplay ? 'Show' : 'Hide')} 
                  onClick={this.onLoadNewRecordButtonClicked}> 
                  发现新的数据，是否加载？ 
          </Button>
        </div>
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