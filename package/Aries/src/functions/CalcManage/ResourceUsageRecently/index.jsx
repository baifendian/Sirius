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
    return Number(v).toFixed(2)
  },

  getInitialState(){
    let days = 90
    let today_start = new Date(Toolkit.generateTimeStrByMilliSeconds(-1).slice(0,'YYYY-MM-DD'.length))
    let start_date_str = Toolkit.generateTimeStrByMilliSeconds(today_start.getTime() - days*24*60*60*1000).slice(0,'YYYY-MM-DD'.length)

    return {
      'days':days+1,              // +1，获取当天的用量
      'startdate':start_date_str,
      'echartFatherDivHeight':0,
    }
  },
  componentWillMount(){
    this.initUserData()
  },
  componentDidMount(){
    this.initCharts()
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
    this.setState({'echartFatherDivHeight':newHeight})
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
    let toolTipInfo = this.userData['echartToolTipFormatterInfo']['memory']
    return Toolkit.unitConversion( 
      v,
      toolTipInfo['base'],
      toolTipInfo['unitArr'],
      toolTipInfo['significantFractionBit']
    )
  },

  resetResourceUsageData(executedData){
    this.userData['resourceUsageData'] = executedData
    
    // 汇总echart的x、y轴数据
    let values = []
    let date_keys = []
    for ( let index = 0 ; index < executedData.length ; index ++ ){
      date_keys.push( executedData[index]['date'] )
      values.push( this.fix(executedData[index]['data']['request']) )
    }
    this.userData['echartDatas'] = {
      'xAxisData':date_keys,
      'seriesData':values
    }
  },

  initUserData(){
    this.userData = {
      'echartObj':undefined,
      'echartTitleText':'资源用量',
      'resourceUsageData':undefined,
      'keywords':['cpu','memory']
    }

    this.userData['divIDs'] = {
      rootDivID:Toolkit.generateGUID(),
      navigationInPageID:Toolkit.generateGUID(),      
      echartFatherDivID:Toolkit.generateGUID(),
    }
    this.userData['autoLayoutInfos'] = [
      layoutInfoGenerator( this.userData['divIDs']['rootDivID'],true ),
      layoutInfoGenerator( this.userData['divIDs']['navigationInPageID'],false,'Const' ),
      layoutInfoGenerator( this.userData['divIDs']['echartFatherDivID'],false,'Var',( newHeight )=>{
        this.onHeightChanged( newHeight )
      } ),
    ]

    this.userData['echartToolTipFormatterInfo'] = {
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
    this.userData['echartTooltipFormatterFunc'] = ( params, ticket, callback ) => {
      if ( !this.userData['resourceUsageData'] ){
        return
      }
      let dataInfo = this.userData['resourceUsageData'][params[0]['dataIndex']]['data']
      let templateStr = this.generateTooltipFormatterStr(3)
      
      let dataObj = {}
      dataObj['time'] = params[0]['name']
      
      // 计算好的资源用量
      dataObj['name'+0] = params[0]['seriesName']
      dataObj['value'+0] = this.renderResourceUsageValue(params[0]['data'])

      for ( let i = 0 ; i < this.userData['keywords'].length ; i ++ ){
        let k = this.userData['keywords'][i]
        let toolTipInfo = this.userData['echartToolTipFormatterInfo'][k]

        dataObj['name'+(i+1)] = toolTipInfo['name']
        dataObj['value'+(i+1)] = toolTipInfo['renderFunc'](dataInfo[toolTipInfo['key']])
      }
      return Toolkit.strFormatter.formatString( templateStr,dataObj)
    }

  },

  initCharts(){
    // 在没有加载到数据的时候，先显示出来空白的图标，这样会比较好看
    let initOptions = {
      'title': { 
        'text': this.userData['echartTitleText']
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
        'formatter': this.userData['echartTooltipFormatterFunc']
      },
      'xAxis': [{
        'type' : 'category',
        'data': []
      }],
      'yAxis':{
        'axisLabel':{
          'show':true,
          //'formatter':undefined
        }
      },
      dataZoom: [{
        show: true,
        start: 80,
        end: 100
      }],
    }
    this.userData['echartObj'] = echarts.init(document.getElementById( 'ResourceUsageEchartDiv' ))
    this.userData['echartObj'].setOption(initOptions)
  },

  requestData(){
    this.userData['echartObj'].showLoading()
    CMDR.getResourceUsageInfo(
      CMDR.getCurNameSpace(this),
      this.state.startdate,
      this.state.days,
      (executedData)=>{
        this.userData['echartObj'].hideLoading()
        this.resetResourceUsageData(executedData)
        this.insertDataToEchart()
      }
    )
  },

  insertDataToEchart(){
    if (!this.userData['resourceUsageData']){
      return
    }
    this.userData['echartObj'].setOption({
      'legend':{
        'data':[this.userData['echartTitleText']]
      },
      'xAxis': {
        'type' : 'category',
        'position' : 'bottom',
        'boundaryGap': false,
        'data': this.userData['echartDatas']['xAxisData']
      },
      'series': [{
        'type': 'bar',
        'name':this.userData['echartTitleText'],
        'data':this.userData['echartDatas']['seriesData'],
      }]
    })
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
        <div id={this.userData['divIDs']['echartFatherDivID']} className="cTabs">
          <div className='ResourceUsageEchartFatherDiv' 
               style={{ 'height':(this.state.echartFatherDivHeight-40)+'px' }}>
            <div id='ResourceUsageEchartDiv' />
          </div>
        </div>
        <AutoLayoutDiv layoutInfos={this.userData['autoLayoutInfos']} />
      </div>
    )
  }
});


export default mod;