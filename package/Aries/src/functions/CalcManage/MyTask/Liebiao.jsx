import React from 'react'
import ReactDOM from 'react-dom'
import DataTable from 'bfd-ui/lib/DataTable'
import './Liebiao.less'

import CMDR from '../CalcManageDataRequester/requester.js'
import './index.less'

const TabLiebiao = React.createClass({
	getInitialState: function () {
    setTimeout( () => { CMDR.getMytaskList( this,this.xhrCallback ) }, 0);

    let state_dict = {
      // 表格信息
      column: [{ title:'任务名称',  key:'task',         order:true }, 
               { title:'类型',      key:'category',     order:true }, 
               { title:'准备时间',  key:'ready_time',   order:true }, 
               { title:'开始时间',  key:'running_time', order:true },
               { title:'完成时间',  key:'leave_time',   order:true },
               { title:'执行状态',  key:'status',       order:true },
               { title:'执行结果',  key:'result',       order:true }],
      showPage:'false',
      data:{"totalList": [],"totalPageNum":0},

    }
    return state_dict
  },

  xhrCallback:(_this,executedData) => {
    _this.setState ( { 
      'data': {
        "totalList": executedData,
        "totalPageNum":executedData.length
      }
    })
  },  

  componentDidMount:function(){
    this.resizeThWidth()
  },

  componentDidUpdate:function(){
    this.resizeTdWidth()
  },

<<<<<<< HEAD
  resizeThWidth:function(){
    let dataTableNode = ReactDOM.findDOMNode( this.refs.DataTable )
    let thead = dataTableNode.childNodes[1].childNodes[0]
    let tr = thead.childNodes[0]
    for( let j = 0 ; j < tr.childNodes.length ; j ++ ){
      tr.childNodes[j].className += ' width_' + j
=======
  querySearchConditions:function(){
    let searchConditions = {
      taskname:this.userData['curTaskName'] ? this.userData['curTaskName'] : '',
      shelltype:this.userData['curShellType'] ? this.userData['curShellType'] : 'ALL',
      executeresult:this.userData['curExecutedResult'] ? this.userData['curExecutedResult'] : 'ALL',
      startdate:this.userData['curStartDate'] ? this.userData['curStartDate'] : Toolkit.generateTimeStrBySeconds(0),
      enddate:this.userData['curEndDate'] ? this.userData['curEndDate'] : Toolkit.generateTimeStrBySeconds(-1).split('T')[0] + 'T23:59:59'
>>>>>>> dev
    }
  },

  resizeTdWidth:function(){
    let dataTableNode = ReactDOM.findDOMNode( this.refs.DataTable )
    let tbody = dataTableNode.childNodes[1].childNodes[1]
    for ( let i = 0 ; i < tbody.childNodes.length ; i ++ ){
      let tr = tbody.childNodes[i]

      if (tr.childNodes.length !== this.state.column.length)
        break

<<<<<<< HEAD
      for( let j = 0 ; j < tr.childNodes.length ; j ++ ){
        tr.childNodes[j].className = 'width_' + j
      }
=======
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
>>>>>>> dev
    }
  },

  /**(loadData:function(){
    function GetRandomNum(Min,Max)
    {   
      var Range = Max - Min;   
      var Rand = Math.random();   
      return(Min + Math.round(Rand * Range));   
    }   
    let t1 = this.state.data
    for (let i = 0 ; i < 10 ; i ++){
      t1['totalList'].push({
        name:'job' + i,
        type:i % 2 == 0 ? '自动' : '手动',
        pretime:'2016-07-04 17:25:00',
        starttime:'2016-07-04 17:25:00',
        finishtime:'None',
        state:i % 2 == 0 ? 'ture' : 'false',
        result:i %2 == 0 ? '成功 过程' : '失败 过程' ,
      })
    }
    t1['totalPageNum'] = t1['totalList'].length
    this.setState({ data:t1 })
  },**/

  render: function() {
    if ( this.height !== this.props.height ){
      setTimeout( ()=>{
        let tablePanel = ReactDOM.findDOMNode( this.refs.DataTableDiv )
        tablePanel.style.height = this.props.height - 20 + 'px'
      } )
      this.height = this.props.height
    }
    return  (
      <div className="LiebiaoRootDiv">
        <div className='DataTableDiv' ref='DataTableDiv'>
          <DataTable ref="DataTable" data={this.state.data} showPage={this.state.showPage} 
            column= { this.state.column } ></DataTable>
          </div>
      </div>
    )
  }
});
export default TabLiebiao