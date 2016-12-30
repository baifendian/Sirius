import React from 'react'
import ReactDOM from 'react-dom'

import FixedTable from 'bfd/FixedTable'
import message from 'bfd/message'

import MonthSelectControl from 'public/MonthSelectControl'
import { AutoLayoutDiv , layoutInfoGenerator } from 'public/AutoLayout'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'
import Button from 'bfd/Button'

import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'
import './index.less'


var mod = React.createClass({
  
  fix(v){
    return Number(v).toFixed(4)
  },

  getInitialState(){
    return {
      'fixedTableDataList':[],
      'fixedTableHeight':0
    }
  },
  componentWillMount(){
    this.initUserData()
  },

  componentDidMount(){
    this.onSearchButtonClicked()
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

    let totalBilling = 0.0
    let totalCPU = 0.0
    let totalMemory = 0.0

    for ( let i in executedData ){
      let curData = executedData[executedData.length-1-i]

      fixedTableDataList.push({
        'Date':curData['date'],
        'ResourceUsage':this.renderResourceUsageValue(curData['data']['request']),
        'CPUUsage':this.renderCPUUsageValue(curData['data'][toolTipInfo['cpu']['key']]),
        'MemoryUsage':this.renderMemoryUsageValue(curData['data'][toolTipInfo['memory']['key']]),
      })
      totalBilling += curData['data']['request']
      totalCPU += curData['data'][toolTipInfo['cpu']['key']]
      totalMemory += curData['data'][toolTipInfo['memory']['key']]
    }
    this.userData['fixedTableDataList'] = fixedTableDataList
    this.userData['totalBilling'] = this.renderResourceUsageValue(totalBilling / executedData.length)
    this.userData['totalCPU'] = this.renderCPUUsageValue(totalCPU / executedData.length)
    this.userData['totalMemory'] = this.renderMemoryUsageValue(totalMemory / executedData.length)
    return fixedTableDataList
  },

  initUserData(){
    this.userData = {
      'resourceUsageData':undefined,
      'keywords':['cpu','memory']
    }

    this.userData['divIDs'] = {
      rootDivID:Toolkit.generateGUID(),
      navigationInPageID:Toolkit.generateGUID(),
      monthSelectControlID:Toolkit.generateGUID(),
      billingTitleDivID:Toolkit.generateGUID(),
      FixedTableFatherDivID:Toolkit.generateGUID(),
    }
    this.userData['autoLayoutInfos'] = [
      layoutInfoGenerator( this.userData['divIDs']['rootDivID'],true ),
      layoutInfoGenerator( this.userData['divIDs']['navigationInPageID'],false,'Const' ),
      layoutInfoGenerator( this.userData['divIDs']['monthSelectControlID'],false,'Const' ),
      layoutInfoGenerator( this.userData['divIDs']['billingTitleDivID'],false,'Const' ),
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
        'significantFractionBit':4,
        'base':1024,

        'name':'Memory用量',
        'key':'memory/request',
        'renderFunc':this.renderMemoryUsageValue,
      },
    }
  },

  requestData( startDate,days ){
    this.setState({ 'fixedTableDataList':[] })
    CMDR.getResourceUsageInfo( CMDR.getCurNameSpace(this),startDate,days,(executedData)=>{
      this.resetResourceUsageData(executedData)
      this.setState({ 'fixedTableDataList':this.userData['fixedTableDataList'] })
    })
  },

  checkDateValid(dateStr){
    let date = new Date(dateStr)
    let curDate = new Date()
    if ( date.getFullYear() > curDate.getFullYear() ){
      return false
    } else if ( date.getFullYear() == curDate.getFullYear() ){
      return (date.getMonth() < curDate.getMonth())
    } else {
      return true
    }
  },

  onSearchButtonClicked(){
    this.setState({ 'fixedTableDataList':[] })
    let dateStr = this.refs.MonthSelectControlRef.getDate()
    if ( !this.checkDateValid(dateStr) ){
      message.danger( '指定月份的账单尚未生成' )
      return
    }

    this.requestData( 
      dateStr.slice(0,'YYYY-MM-DD'.length),
      Toolkit.calcMonthDays(dateStr)
    )
  },

  render: function() {
    let lastMonthDate = new Date(new Date().getTime() - Toolkit.calcMonthDays(new Date())*24*60*60*1000)
    let defaultSearchDateStr = Toolkit.generateTimeStrByMilliSeconds(lastMonthDate.getTime()).slice( 0,'YYYY-MM'.length )

    let dStr = this.refs.MonthSelectControlRef ? this.refs.MonthSelectControlRef.getValue() : defaultSearchDateStr
    let billingTitle = Toolkit.strFormatter.formatString('{date} {nameSpace} 账单信息',{
      'nameSpace':CalcManageConf.getCurSpace(this),
      'date':dStr.split('-').join('年') + '月'
    })

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
        <div id={this.userData['divIDs']['monthSelectControlID']} className="MiddleBillingBlock">
          <table className='SearchLayoutTable'>
            <tbody>
              <tr>
                <td></td>
                <td><MonthSelectControl defaultValue={defaultSearchDateStr} ref="MonthSelectControlRef" /></td>
                <td></td>
                <td><Button onClick={this.onSearchButtonClicked}>查询</Button></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div id={this.userData['divIDs']['billingTitleDivID']} className="MiddleBillingBlock">
          <h2>{billingTitle}</h2>
          <table className="BillingOverviewInfoTable">
            <tbody>
              <tr>
                <td></td>
                <td>空间</td>
                <td></td>
                <td>{CalcManageConf.getCurSpace(this)}</td>
              </tr>
              <tr>
                <td></td>
                <td>月账单</td>
                <td></td>
                <td>{this.userData['totalBilling']}</td>
              </tr>
              <tr>
                <td></td>
                <td>月平均CPU</td>
                <td></td>
                <td>{this.userData['totalCPU']}</td>
              </tr>
              <tr>
                <td></td>
                <td>月平均内存</td>
                <td></td>
                <td>{this.userData['totalMemory']}</td>
              </tr>
            </tbody>
          </table>
          <hr/>
          <h2>详单</h2>
        </div>
        <div className="FixedTableFatherDiv MiddleBillingBlock" id={this.userData['divIDs']['FixedTableFatherDivID']}>
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