import React from 'react'
import echarts from 'echarts'
import Percentage from 'bfd-ui/lib/Percentage'

import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'

import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'

import './index.less'


/**
 * 页面大改：
 * 饼图只保留 Pod的已创建个数和最大创建个数，其它的删掉
 * 线图变更为四个：
 *    集群CPU使用率
 *    集群内存使用率
 *    集群网络使用情况
 *    集群FileSystem使用情况
 * 页面可以参考：
 *    http://grafana.bfdcloud.com/          （Cluster显示集群的信息，Pods显示Pod的信息）
 *    http://k8sinflux.bfdcloud.com/
 * 
 * 其中的一些字段的含义：
 *    Request：申请的量
 *    Limit：实际分配的量
 *    Usage：实际使用的量
 * influxdb官方提供的dashboard
 *    http://k8sinflux.bfdcloud.com/
 *    http://k8sinfluxapi.bfdcloud.com/ , 80
 *        账号 admin
 *        密码 admin
 * 
 * 
 */



var mod = React.createClass({
  getInitialState:function(){
    return CMDR.generateRandomData()
  },
  load_data(dataDict){
    console.dir(dataDict)
    this.setState({
      pod_used:dataDict['pod_used'],
      pod_total:dataDict['pod_total'],
      task_used:dataDict['task_used'],
      task_total:dataDict['task_total'],
      memory_used:dataDict['memory_used'],
      memory_total:dataDict['memory_total'],
      load_data_points:dataDict['load_data_points'],
      flowrate_data_points:dataDict['flowrate_data_points']
    })
    
  },
  formatPercent(used,total){
    return (total == 0) ? 100 : parseInt( 100 * used / total)
  },
  selectColorByPercent(percent){
    if (percent <= 33.33){
      return '#1CB162'
    }else if (percent <= 66.66){
      return '#1BB8FA'
    }else {
      return '#FA7252'
    }
  },

  generateLineSeriesObj( lineName,dataArr ){
    let obj = {
      type: 'line',
      itemStyle: {
        normal: {
          lineStyle:{            
          },
          areaStyle: {
            type: 'default',
            color: 'rgba(255,0,0,0.1)'
          }
        }
      },    
      name: lineName,
      data: dataArr
    }
    return obj
  },

  componentDidMount(){
    this.userData = {}
    this.initColorPoll()

    this.initCharts()
    this.checkToRequestData()
  },

  initColorPoll(){
    this.userData['colorPoll'] = [{
      'line':'rgb(255,0,0)',
      'area':'rgba(255,0,0,0.3)'
    },{
      'line':'rgb(255,255,0)',
      'area':'rgba(255,255,0,0.3)'
    },{
      'line':'rgb(0,255,255)',
      'area':'rgba(0,255,255,0.3)'
    },{      
      'line':'rgb(0,0,255)',
      'area':'rgba(0,0,255,0.3)'
    }]
  },

  generateInitXAxisArr(){
    let xAxisArr = []
    let curTimeStamp = new Date().getTime()
    for ( let i = 0 ; i < 30+1 ; i ++ ){
      let ts = curTimeStamp-(30-i)*60*1000
      xAxisArr.push( Toolkit.generateTimeStrByMilliSeconds( ts )   )
    }
    return xAxisArr
  },

  initCharts(){
    let clusterInfoDict = {
      'cpu':'EchartCPUInfoDiv',
      'memory':'EchartMemoryInfoDiv',
      'network':'EchartNetworkInfoDiv',
      'filesystem':'EchartFilesystemInfoDiv'
    }
    let xAxisData = this.generateInitXAxisArr()
    for ( let identifyStr in clusterInfoDict ){
      this.userData[identifyStr] = echarts.init(document.getElementById( clusterInfoDict[identifyStr] ))

      // 在没有加载到数据的时候，先显示出来空白的图标，这样会比较好看
      let initOptions = {
        'title': { 
          'text': Toolkit.strFormatter.formatString('集群 {chartName} 使用情况',{ 'chartName':identifyStr })
        },
        'toolbox': {  
          'show' : true,
          'feature' : {
            'oneHour':{
              'show':true,    
              'title':'1小时',
              'icon' : 'logo.png',
              'onclick':function(option1) {
                alert('1');
              }
            },
            'saveAsImage':{
              'show': true
            }  
          }  
        },
        'tooltip' : {
          'trigger': 'axis'
        },
        'xAxis': [{
          'type' : 'category',
          'data': xAxisData
        }],
        'yAxis':{},
      }
      this.userData[identifyStr].setOption(initOptions)
    }
    this.userData['clusterInfoDict'] = clusterInfoDict
  },

  insertDataToChart( chartName,executedData ){
    let series = []
    let legend = []
    for ( let i = 0 ; i < executedData.series.length ; i ++ ){
      legend.push( executedData['series'][i]['legend'] )
      
      let seriesDataObj = this.generateLineSeriesObj( executedData['series'][i]['legend'],executedData['series'][i]['data'] )
      seriesDataObj['itemStyle']['normal']['lineStyle']['color'] = this.userData['colorPoll'][i]['line']        // 线颜色
      seriesDataObj['itemStyle']['normal']['areaStyle']['color'] = this.userData['colorPoll'][i]['area']        // 区域颜色
      series.push( seriesDataObj )
    }
    
    this.userData[chartName].setOption({
      'legend': { 
        'data':legend
      },
      'xAxis': {
        'type' : 'category',
        'position' : 'bottom',
        'boundaryGap': false,
        'data': executedData['xaxis']
      },
      'series': series
    })
  },

  xhrCPUCallback(_this,executedData){
    _this.insertDataToChart( 'cpu',executedData )
  },
  xhrMemoryCallback(_this,executedData) {
    _this.insertDataToChart( 'memory',executedData )
  },
  xhrNetworkCallback(_this,executedData) {
    _this.insertDataToChart( 'network',executedData )
  },
  xhrFilesystemCallback(_this,executedData) {
    _this.insertDataToChart( 'filesystem',executedData )
  },
  
  checkToRequestData(){
    // 如果当前保存的namespace与实时获取的namespace相同，则不再重新请求
    // 否则，重新请求数据
    let curNameSpace = CalcManageConf.getCurSpace(this);
    if ( this.userData['nameSpace'] !== curNameSpace ){
      this.userData['nameSpace'] = curNameSpace

      CMDR.getClusterCPUInfo( this,curNameSpace,30,this.xhrCPUCallback )
      CMDR.getClusterMemoryInfo( this,curNameSpace,30,this.xhrMemoryCallback )
      CMDR.getClusterNetworkInfo( this,curNameSpace,30,this.xhrNetworkCallback )
      CMDR.getClusterFilesystemInfo( this,curNameSpace,30,this.xhrFilesystemCallback )
    }
  },

  render: function() {
    let spaceName = CalcManageConf.getCurSpace(this);    
    let pod_percent = this.formatPercent( this.state.pod_used,this.state.pod_total )
    let task_percent = this.formatPercent( this.state.task_used,this.state.task_total)
    let memory_percent = this.formatPercent( this.state.memory_used,this.state.memory_total)

    return (
      <div className="MyCalcManagerOverviewChildRootDiv">
          <NavigationInPage headText={CalcManageConf.getNavigationData({
                            pageName:'Overview',
                            type : 'headText'
                          })} 
                          naviTexts={CalcManageConf.getNavigationData({
                            pageName:'Overview',
                            type:'navigationTexts',
                            spaceName:spaceName
                          })} />
          <div id="EchartCPUInfoDiv"        className="EchartClusterInfoDiv"/>
          <div id="EchartMemoryInfoDiv"     className="EchartClusterInfoDiv" />
          <div id="EchartNetworkInfoDiv"    className="EchartClusterInfoDiv" />
          <div id="EchartFilesystemInfoDiv" className="EchartClusterInfoDiv" />

          <table className="PercentageFatherDiv" style={{'display':'none'}}>
            <tbody>
              <tr className="PercentPic">
                <td>
                  <Percentage percent={pod_percent} 
                              foreColor={this.selectColorByPercent(pod_percent)} 
                              textColor={this.selectColorByPercent(pod_percent)} 
                              style={{width: '150px'}} 
                              ref="pod_percent" />
                </td>
                <td>
                  <Percentage percent={task_percent} 
                              foreColor={this.selectColorByPercent(task_percent)} 
                              textColor={this.selectColorByPercent(task_percent)} 
                              style={{width: '150px'}} 
                              ref="task_percent" />
                </td>
                <td>
                  <Percentage percent={memory_percent} 
                              foreColor={this.selectColorByPercent(memory_percent)} 
                              textColor={this.selectColorByPercent(memory_percent)} 
                              style={{width: '150px'}} 
                              ref="memory_percent" />
                </td>
              </tr>
              <tr className="PercentText">
                <td>Pod</td>
                <td>计算任务</td>
                <td>内存</td>
              </tr>
              <tr className="PercentDetail">
                <td>{this.state.pod_used}&nbsp;/&nbsp;{this.state.pod_total}</td>
                <td>{this.state.task_used}&nbsp;/&nbsp;{this.state.task_total}</td>
                <td>{this.state.memory_used}&nbsp;/&nbsp;{this.state.memory_total}</td>
              </tr>
            </tbody>
          </table>
      </div>
    )
  }
});


export default mod;