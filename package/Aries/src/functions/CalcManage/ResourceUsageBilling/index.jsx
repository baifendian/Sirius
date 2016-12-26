import React from 'react'
import ReactDOM from 'react-dom'

import FixedTable from 'bfd/FixedTable'

import { AutoLayoutDiv , layoutInfoGenerator } from 'public/AutoLayout'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'

import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'
import './index.less'


var mod = React.createClass({
  
  fix(v){
    return Number(v).toFixed(2)
  },

  getInitialState(){
    let days = 90
    let today_start = new Date(Toolkit.generateTimeStrByMilliSeconds(-1).slice(0,'YYYY-MM-DD'.length))
    let start_date_str = Toolkit.generateTimeStrByMilliSeconds(today_start.getTime() - days*24*60*60*1000).slice(0,'YYYY-MM-DD'.length)

    return {
      'days':days+1,      // +1，获取当天的用量
      'startdate':start_date_str,
      'fixedTableDataList':[],
      'fixedTableHeight':0
    }
  },
  componentWillMount(){
    this.initUserData()
  },
  componentDidMount(){
    this.checkToRequestData()
  },
  componentDidUpdate(){
    this.checkToRequestData()
  },

  checkToRequestData(){
    let curNameSpace = CMDR.getCurNameSpace(this)
    if ( this.curNameSpace !== curNameSpace ){
      this.curNameSpace = curNameSpace
      this.requestData()
    }
  },

  onHeightChanged(newHeight){
    this.setState({'fixedTableHeight':newHeight})
  },

  // 对cpu、memory、用量等数据进行进制转换、单位变换
  renderResourceUsageValue( v ){
    return this.fix(v) + ' 机器/天'
  },
  // cpu数据的含义是毫核的个数，但是要求界面上展示虚拟核的个数，因此直接除以 1000
  renderCPUUsageValue(v){
    return this.fix(v/1000) + ' VCPU'
  },
  renderMemoryUsageValue(v){
    let toolTipInfo = this.userData['dataFormatterInfo']['memory']
    return Toolkit.unitConversion( 
      v,
      toolTipInfo['base'],
      toolTipInfo['unitArr'],
      toolTipInfo['significantFractionBit']
    )
  },

  resetResourceUsageData(executedData){
    this.userData['resourceUsageData'] = executedData

    // 转换数据格式，方便 FixedTable 使用
    let toolTipInfo = this.userData['dataFormatterInfo']
    let fixedTableDataList = []
    for ( let i in executedData ){
      let curData = executedData[executedData.length-1-i]

      fixedTableDataList.push({
        'Date':curData['date'],
        'ResourceUsage':this.renderResourceUsageValue(curData['data']['request']),
        'CPUUsage':this.renderCPUUsageValue(curData['data'][toolTipInfo['cpu']['key']]),
        'MemoryUsage':this.renderMemoryUsageValue(curData['data'][toolTipInfo['memory']['key']]),
      })
    }
    this.userData['fixedTableDataList'] = fixedTableDataList
  },

  initUserData(){
    this.userData = {
      'resourceUsageData':undefined,
      'keywords':['cpu','memory']
    }

    this.userData['divIDs'] = {
      rootDivID:Toolkit.generateGUID(),
      navigationInPageID:Toolkit.generateGUID(),      
      FixedTableFatherDivID:Toolkit.generateGUID(),
    }
    this.userData['autoLayoutInfos'] = [
      layoutInfoGenerator( this.userData['divIDs']['rootDivID'],true ),
      layoutInfoGenerator( this.userData['divIDs']['navigationInPageID'],false,'Const' ),
      layoutInfoGenerator( this.userData['divIDs']['FixedTableFatherDivID'],false,'Var',( newHeight )=>{
        this.onHeightChanged( newHeight )
      } ),
    ]

    this.userData['fixedTableColumn'] = [
      { title:'日期',          key:'Date' },
      { title:'资源用量',       key:'ResourceUsage' },
      { title:'CPU用量',       key:'CPUUsage' },
      { title:'Memory用量',    key:'MemoryUsage' },
    ]
    this.userData['dataFormatterInfo'] = {
      'cpu':{
        'name':'CPU用量',
        'key':'cpu/request',
        'renderFunc':this.renderCPUUsageValue,
      },
      'memory':{
        'unitArr':['B','KiB','MiB','GiB','TiB','PiB'],
        'significantFractionBit':2,
        'base':1024,

        'name':'Memory用量',
        'key':'memory/request',
        'renderFunc':this.renderMemoryUsageValue,
      },
    }
  },


  requestData(){
    this.setState({ 'fixedTableDataList':[] })
    CMDR.getResourceUsageInfo(
      CMDR.getCurNameSpace(this),
      this.state.startdate,
      this.state.days,
      (executedData)=>{
        this.resetResourceUsageData(executedData)
        this.setState({ 'fixedTableDataList':this.userData['fixedTableDataList'] })
      }
    )
  },

  render: function() {
    return (
      <div id={this.userData['divIDs']['rootDivID']} className="ResourceUsageBillingRootDiv">
        <div id={this.userData['divIDs']['navigationInPageID']}>
          <NavigationInPage ref="NavigationInPage" 
                            headText={CalcManageConf.getNavigationData({
                              pageName:'ResourceUsageBilling',
                              type : 'headText'
                            })} 
                            naviTexts={CalcManageConf.getNavigationData({
                              pageName:'ResourceUsageBilling',
                              type:'navigationTexts',
                              spaceName:CalcManageConf.getCurSpace(this)
                            })} />
        </div>
        <div className="FixedTableFatherDiv" id={this.userData['divIDs']['FixedTableFatherDivID']}>
          <FixedTable className="FixedTable" ref="FixedTable" 
                          height={ this.state.fixedTableHeight-90 }
                          data={ this.state.fixedTableDataList }
                          showPage='false'
                          column={ this.userData['fixedTableColumn'] } />
        </div>
        <AutoLayoutDiv layoutInfos={this.userData['autoLayoutInfos']} />
      </div>
    )
  }
});


export default mod;