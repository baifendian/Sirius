import React from 'react'
import ReactDOM from 'react-dom'
import echarts from 'echarts'

import { Tabs, TabList, Tab, TabPanel } from 'bfd/Tabs'

import { AutoLayoutDiv , layoutInfoGenerator } from 'public/AutoLayout'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'
import ResourceMonitorEchart from 'public/ResourceMonitorEchart'

import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'
import './index.less'


var mod = React.createClass({
  
  fix(v){
    return Number(v).toFixed(4)
  },

  getInitialState(){
    return {
      'echartFatherDivHeight':0,
      'totalResourceUsage':undefined,
      'totalCPU':undefined,
      'totalMemory':undefined,
    }
  },
  componentWillMount(){
    this.initUserData()
  },
  componentDidMount(){
    this.initCharts()
    this.checkToRequestData()
    window.addEventListener( 'resize',this.onWindowResize )
  },

  componentDidUpdate(){
    this.checkToRequestData()
  },

  onWindowResize(){
    window.removeEventListener( 'resize',this.onWindowResize )
    for ( let i in this.userData['keywords'] ){
      let obj = this.userData['echartObjs'][ this.userData['keywords'][i] ]
      obj && obj.resize()
    }
    
    window.addEventListener( 'resize',this.onWindowResize )
  },

  checkToRequestData(){
    let curNameSpace = CMDR.getCurNameSpace(this)
    if ( this.curNameSpace !== curNameSpace ){
      this.curNameSpace = curNameSpace
      this.requestData()
    }
  },

  resetrequestedUsageData(executedData,recentDaysStartDate,monthFirstDate){
    this.userData['requestedUsageData'] = executedData
    let echartBaseInfo = this.userData['echartBaseInfo']
    
    // 汇总echart的x、y轴数据
    let dateKeys = []
    let resourceUsageValues = []
    let cpuUsageValues = []
    let memoryUsageValues = []
    for ( let index = 0 ; index < executedData.length ; index ++ ){
      // 走势图显示近14天的数据
      if ( recentDaysStartDate.getTime() <= new Date(executedData[index]['date']).getTime() ){
        dateKeys.push( executedData[index]['date'] )
        resourceUsageValues.push( executedData[index]['data'][ echartBaseInfo['resourceUsage']['key'] ] )
        cpuUsageValues.push( executedData[index]['data'][ echartBaseInfo['cpu']['key'] ] )
        memoryUsageValues.push( executedData[index]['data'][ echartBaseInfo['memory']['key'] ] )
      }
    }
    this.userData['echartData']['resourceUsage'] = {
      'xAxisData':dateKeys,
      'seriesData':resourceUsageValues
    }
    this.userData['echartData']['cpu'] = {
      'xAxisData':dateKeys,
      'seriesData':cpuUsageValues
    }
    this.userData['echartData']['memory'] = {
      'xAxisData':dateKeys,
      'seriesData':memoryUsageValues
    }

    let days = 0.0
    // 计算出来本月的CPU、内存、用量总和
    let totalResourceUsage = 0.0
    let totalCPU = 0.0
    let totalMemory = 0.0

    for ( let i in executedData ){
      let curData = executedData[executedData.length-1-i]
      // 汇总数据显示月初到当天的汇总
      if ( monthFirstDate.getTime() <= new Date(curData['date']).getTime() ){
        days += 1
        totalResourceUsage += curData['data'][ echartBaseInfo['resourceUsage']['key'] ]
        totalCPU += curData['data'][ echartBaseInfo['cpu']['key'] ]
        totalMemory += curData['data'][ echartBaseInfo['memory']['key'] ]
      }
    }

    this.setState({'totalResourceUsage':totalResourceUsage/days})
    this.setState({'totalCPU':totalCPU/days})
    this.setState({'totalMemory':totalMemory/days})
  },

  initUserData(){
    this.userData = {}

    // AutoLayout 需要使用的一些信息
    this.userData['divIDs'] = {
      'rootDivID':Toolkit.generateGUID(),
      'navigationInPageID':Toolkit.generateGUID(),
      'recentlyTitleDivID':Toolkit.generateGUID(),
      'echartFatherDivID':Toolkit.generateGUID(),
    }
    this.userData['autoLayoutInfos'] = [
      layoutInfoGenerator( this.userData['divIDs']['rootDivID'],true ),
      layoutInfoGenerator( this.userData['divIDs']['navigationInPageID'],false,'Const' ),
      layoutInfoGenerator( this.userData['divIDs']['recentlyTitleDivID'],false,'Const' ),
      layoutInfoGenerator( this.userData['divIDs']['echartFatherDivID'],false,'Var',( newHeight )=>{
        this.setState({'echartFatherDivHeight':newHeight})
      } ),
    ]

    // echart保存的一些信息
    this.userData['echartObjs'] = {}
    this.userData['keywords'] = ['resourceUsage','cpu','memory']
    this.userData['recentlyDays'] = 14
    this.userData['requestedUsageData'] = undefined      // 它保存了从后台请求到的原始数据
    
    this.userData['echartBaseInfo'] = {
      'resourceUsage':{
        'name':'资源用量',
        'key':'request',
        'renderFunc':this.renderResourceUsageValue,
        'divID':'ResourceUsageEchartDiv',
        'tooltipFormatterFunc':undefined,
        'yAxisLabelFormatterFunc':undefined,
      },
      'cpu':{
        'name':'CPU用量',
        'key':'cpu/request',
        'renderFunc':this.renderCPUUsageValue,
        'divID':'CPUEchartDiv',
        'tooltipFormatterFunc':undefined,
        'yAxisLabelFormatterFunc':undefined,
      },
      'memory':{
        'name':'Memory用量',
        'key':'memory/request',
        'renderFunc':this.renderMemoryUsageValue,
        'divID':'MemoryEchartDiv',
        'tooltipFormatterFunc':undefined,
        'yAxisLabelFormatterFunc':undefined,

        'unitArr':['B','KiB','MiB','GiB','TiB','PiB'],
        'significantFractionBit':4,
        'base':1024,
      },
    }

    // 从后台请求到的数据并进行处理之后，会放到这里
    this.userData['echartData'] = {
      'resourceUsage':{},
      'cpu':{},
      'memory':{},
    }

    // 用来渲染数据的单位的函数
    this.userData['echartBaseInfo']['resourceUsage']['renderFunc'] = (v)=>{ return this.fix(v) + ' 机器/天' }
    // cpu数据的含义是毫核的个数，但是要求界面上展示虚拟核的个数，因此直接除以 1000
    this.userData['echartBaseInfo']['cpu']['renderFunc'] = (v)=>{ return this.fix(v/1000) + ' VCPU' }
    this.userData['echartBaseInfo']['memory']['renderFunc'] = (v)=>{
      let echartBaseInfo = this.userData['echartBaseInfo']['memory']
      return Toolkit.unitConversion( 
        v,
        echartBaseInfo['base'],
        echartBaseInfo['unitArr'],
        echartBaseInfo['significantFractionBit']
      )
    }

    // 用来渲染echart的tooltip的回调函数
    let tooltipFormatterFunc = (echartBaseInfo,x,y,yLabel)=>{
      if ( !this.userData['requestedUsageData'] ){
        return
      }
      return Toolkit.strFormatter.formatString( this.generateTooltipFormatterStr(1),{
        'time':x,
        'name0':yLabel,
        'value0':echartBaseInfo['renderFunc'](y)
      })      
    }
    this.userData['echartBaseInfo']['resourceUsage']['tooltipFormatterFunc'] = ( params, ticket, callback ) => {
      let echartBaseInfo = this.userData['echartBaseInfo']['resourceUsage']
      return tooltipFormatterFunc( echartBaseInfo,params[0]['name'],params[0]['data'],params[0]['seriesName'] )
    }
    this.userData['echartBaseInfo']['cpu']['tooltipFormatterFunc'] = ( params, ticket, callback ) => {
      let echartBaseInfo = this.userData['echartBaseInfo']['cpu']
      return tooltipFormatterFunc( echartBaseInfo,params[0]['name'],params[0]['data'],params[0]['seriesName'] )
    }
    this.userData['echartBaseInfo']['memory']['tooltipFormatterFunc'] = ( params, ticket, callback ) => {
      let echartBaseInfo = this.userData['echartBaseInfo']['memory']
      return tooltipFormatterFunc( echartBaseInfo,params[0]['name'],params[0]['data'],params[0]['seriesName'] )
    }

    // 用来渲染echart的y轴标签的回调函数
    this.userData['echartBaseInfo']['resourceUsage']['yAxisLabelFormatterFunc'] = ( value, index ) => {
      return this.userData['echartBaseInfo']['resourceUsage']['renderFunc'](value)
    }
    this.userData['echartBaseInfo']['cpu']['yAxisLabelFormatterFunc'] = ( value, index ) => {
      return this.userData['echartBaseInfo']['cpu']['renderFunc'](value)
    }
    this.userData['echartBaseInfo']['memory']['yAxisLabelFormatterFunc'] = ( value, index ) => {
      return this.userData['echartBaseInfo']['memory']['renderFunc'](value)
    }
  },

  initCharts(){
    let colorPool = ['rgba(38,166,154,0.9)','rgba(255,138,101,0.9)','rgba(102,187,106,0.9)']

    for ( let i in this.userData['keywords'] ){
      let k = this.userData['keywords'][i]
      let echartBaseInfo = this.userData['echartBaseInfo'][k]

      let initOptions = this.generateInitEchartOption(echartBaseInfo['name'],echartBaseInfo['tooltipFormatterFunc'],echartBaseInfo['yAxisLabelFormatterFunc'])
      initOptions['color'] = [colorPool[i]]

      this.userData['echartObjs'][k] = echarts.init(document.getElementById( echartBaseInfo['divID'] ))
      this.userData['echartObjs'][k].setOption( initOptions )
    }
  },

  requestData(){
    // 该页面需要两块数据：账单信息要求显示本月初到今天的数据。走势图需要近14天的数据，为了一次请求成功，因此需要把这两个时间段的数据汇总起来
    let todayStartStr = Toolkit.generateTimeStrByMilliSeconds(-1).slice(0,'YYYY-MM-DD'.length)
    let sDate1 = new Date(new Date(todayStartStr).getTime() - (this.userData['recentlyDays']-1)*24*60*60*1000)     // 最近14天
    let sDate2 = new Date(todayStartStr.slice(0,'YYYY-MM'.length)+'-01')                  // 月初

    let days = undefined
    let sDate = undefined
    if ( sDate1.getTime() < sDate2.getTime() ){
      sDate = sDate1
      days = this.userData['recentlyDays']
    } else {
      sDate = sDate2
      days = new Date(todayStartStr).getDate()
    }
    let startDateStr = Toolkit.generateTimeStrByMilliSeconds(sDate.getTime()).slice(0,'YYYY-MM-DD'.length)

    for ( let i in this.userData['keywords'] ){
      this.userData['echartObjs'][ this.userData['keywords'][i] ].showLoading()
    }
    CMDR.getResourceUsageInfo(CMDR.getCurNameSpace(this),startDateStr,days,(executedData)=>{
      this.resetrequestedUsageData(executedData,sDate1,sDate2)
      this.insertDataToEchart()
      for ( let i in this.userData['keywords'] ){
        this.userData['echartObjs'][ this.userData['keywords'][i] ].hideLoading()
      }
    })
  },

  insertDataToEchart(){
    if (!this.userData['requestedUsageData']){
      return
    }
    for ( let i in this.userData['keywords'] ){
      let k = this.userData['keywords'][i]
      this.userData['echartObjs'][k].setOption({
        'legend':{
          'data':[this.userData['echartBaseInfo'][k]['name']]
        },
        'xAxis': {
          'type' : 'category',
          'data': this.userData['echartData'][k]['xAxisData']
        },
        'series': [{
          'type': 'bar',
          'name':this.userData['echartBaseInfo'][k]['name'],
          'data':this.userData['echartData'][k]['seriesData'],
        }]
      })      
    }
  },

  generateInitEchartOption( title,tooltipFormatterFunc,yAxisLabelFormatterFunc ){
    return {
      'title': { 
        'text': title
      },
      toolbox: {
        'show':true,
        'feature':{
          'mark':{
            'show': true
          },
          'magicType':{
            'show':true,
            'type':['line', 'bar']
          },
        }
      },
      'tooltip' : {
        'trigger': 'axis',
        'formatter': tooltipFormatterFunc
      },
      grid:{
        'x': 120
      },
      'xAxis': [{
        'type' : 'category',
        'data': []
      }],
      'yAxis':{
        'axisLabel':{
          'show':true,
          'formatter':yAxisLabelFormatterFunc
        }
      },
    }
  },

  generateTooltipFormatterStr( lineNumber ){
    let templateStr = '<tr><td colspan="3">{time}</td></tr>'
    for ( let i = 0 ; i < lineNumber ; i ++ ){
      templateStr += '<tr>'
      templateStr += '<td>{name'+i+'}</td>'
      templateStr += '<td class="SpaceTdDistraction"></td>'
      templateStr += '<td>{value'+i+'}</td>'
      templateStr += '</tr>'
    }
    return '<table class="TooltipTable"><tbody>' + templateStr + '</tbody></table>'
  },

  render: function() {

    let monthFirstDayStr = Toolkit.generateTimeStrByMilliSeconds((new Date()).getTime()).slice( 0,'YYYY-MM'.length )
    let recentlyTitle = Toolkit.strFormatter.formatString('{date} {nameSpace} 账单信息（截至到当前时间）',{
      'nameSpace':CalcManageConf.getCurSpace(this),
      'date':monthFirstDayStr.split('-').join('年') + '月'
    })

    let picTitle = Toolkit.strFormatter.formatString('近 {days} 天资源走势图',{'days':this.userData['recentlyDays']})

    let totalResourceUsage = this.state.totalResourceUsage != undefined ? this.userData['echartBaseInfo']['resourceUsage']['renderFunc'](this.state.totalResourceUsage) : ''
    let totalCPU = this.state.totalCPU != undefined ? this.userData['echartBaseInfo']['cpu']['renderFunc'](this.state.totalCPU) : ''
    let totalMemory = this.state.totalMemory != undefined ? this.userData['echartBaseInfo']['memory']['renderFunc'](this.state.totalMemory) : ''
    
    return (
      <div id={this.userData['divIDs']['rootDivID']} className="ResourceUsageRecentlyRootDiv">
        <div id={this.userData['divIDs']['navigationInPageID']}>
          <NavigationInPage ref="NavigationInPage" 
                            headText={CalcManageConf.getNavigationData({
                              pageName:'ResourceUsageRecently',
                              type : 'headText'
                            })} 
                            naviTexts={CalcManageConf.getNavigationData({
                              pageName:'ResourceUsageRecently',
                              type:'navigationTexts',
                              spaceName:CalcManageConf.getCurSpace(this)
                            })} />
        </div>
        <div id={this.userData['divIDs']['recentlyTitleDivID']} className="MiddleMainBlock">
          <h2>{recentlyTitle}</h2>
          <table className="RecentlyOverviewInfoTable">
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
                <td>{totalResourceUsage}</td>
              </tr>
              <tr>
                <td></td>
                <td>月平均CPU</td>
                <td></td>
                <td>{totalCPU}</td>
              </tr>
              <tr>
                <td></td>
                <td>月平均内存</td>
                <td></td>
                <td>{totalMemory}</td>
              </tr>
            </tbody>
          </table>
          <hr/>
          <h2>{picTitle}</h2>
        </div>
        <div id={this.userData['divIDs']['echartFatherDivID']}>
          <div className='EchartFatherDiv' style={{ 'height':(this.state.echartFatherDivHeight-40)+'px' }}>
            <div id='ResourceUsageEchartDiv' />
            <div id='CPUEchartDiv' />
            <div id='MemoryEchartDiv' />
          </div>
        </div>
        <AutoLayoutDiv layoutInfos={this.userData['autoLayoutInfos']} />
      </div>
    )
  }
});


export default mod;