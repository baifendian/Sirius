import React from 'react'
import ReactDOM from 'react-dom'
import echarts from 'echarts'

import { AutoLayoutDiv , layoutInfoGenerator } from 'public/AutoLayout'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'
import ResourceMonitorEchart from 'public/ResourceMonitorEchart'

import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'

import './index.less'


var mod = React.createClass({
  
  getInitialState(){
    return {
      echartFatherTbodyHeight:0,
    }
  },

  componentWillMount(){
    this.initUserData()
  },

  componentDidMount(){
    this.adjustEchartSize()
    window.addEventListener('resize',this.adjustEchartSize)
  },

  componentDidUpdate(){
    this.adjustEchartSize()
    this.reloadEchartData()
  },

  reloadEchartData(){
    let curNameSpace = CMDR.getCurNameSpace(this)
    if ( this.curNameSpace !== curNameSpace ){
      for ( let i = 0 ; i < this.userData['resourceTypes'].length ; i ++ ){
        this.refs[this.userData['resourceTypes'][i]+'Ref'].reloadEchartData()
      }
      this.curNameSpace = curNameSpace
    }
  },

  adjustEchartSize(){
    for ( let i = 0 ; i < this.userData['resourceTypes'].length ; i ++ ){
      this.refs[this.userData['resourceTypes'][i]+'Ref'].resizeEchart()
    }
  },

  onHeightChanged(newHeight){
    this.setState( {echartFatherTbodyHeight:newHeight} )
    this.adjustEchartSize()
  },

  initUserData(){
    this.userData = {}

    // 生成ID列表
    this.userData['idList'] = {
      'idRoot':Toolkit.generateGUID(),
      'navigationInPageID':Toolkit.generateGUID(),
      'monitorEchartTableID':Toolkit.generateGUID()
    }
    
    // 生成 ID 与高度策略对应关系：
    this.userData['layoutInfoArr'] = [
      layoutInfoGenerator( this.userData['idList']['idRoot'],true ),
      layoutInfoGenerator( this.userData['idList']['navigationInPageID'],false,'Const' ),
      layoutInfoGenerator( this.userData['idList']['monitorEchartTableID'],false,'Var',( newHeight )=>{
        this.onHeightChanged( newHeight )
      })
    ]
    
    this.userData['resourceTypes'] = ['cpu','memory','network','filesystem']
    
    this.userData['echartDivID'] = {
      'cpu':'EchartCPUInfoDiv',
      'memory':'EchartMemoryInfoDiv',
      'network':'EchartNetworkInfoDiv',
      'filesystem':'EchartFilesystemInfoDiv'
    }

    this.userData['echartTitleText'] = {
      'cpu':'CPU',
      'memory':'Memory',
      'network':'Network',
      'filesystem':'Filesystem'
    }

    // 将url请求与回调都放到一起，便于管理
    this.userData['requestMonitorDataCallBackFunc'] = {
      'cpu':        ( value,dataCallBack )=>{ CMDR.getPodSummaryCPUInfo( CMDR.getCurNameSpace(this),value,dataCallBack) },
      'memory':     ( value,dataCallBack )=>{ CMDR.getPodSummaryMemoryInfo( CMDR.getCurNameSpace(this),value,dataCallBack) },
      'network':    ( value,dataCallBack )=>{ CMDR.getPodSummaryNetworkInfo( CMDR.getCurNameSpace(this),value,dataCallBack) },
      'filesystem': ( value,dataCallBack )=>{ CMDR.getPodSummaryFilesystemInfo( CMDR.getCurNameSpace(this),value ,dataCallBack) },
    }

    this.userData['echartToolTipFormatterInfo'] = {
      'cpu':{
        'seriesNumber':3,
        'unitArr':['','K','M','G','T','P'],
        'significantFractionBit':0,
        'base':1000,
      },
      'memory':{
        'seriesNumber':4,
        'unitArr':['B','KB','MB','GB','TB','PB'],
        'significantFractionBit':2,
        'base':1000,
      },
      'network':{
        'seriesNumber':2,
        'unitArr':['Bps','KBps','MBps','GBps','TBps','PBps'],
        'significantFractionBit':2,
        'base':1000,
      },
      'filesystem':{
        'seriesNumber':2,
        'unitArr':['B','KB','MB','GB','TB','PB'],
        'significantFractionBit':2,
        'base':1000,
      },
    }
  },




  render: function() {
    let dataRangeMinutes = [
      {'value':60,   'disStr':'最近1小时'},
      {'value':60*6, 'disStr':'最近6小时'},
      {'value':60*24,'disStr':'最近1天'}
    ]
    let layout = [
      ['cpu','memory'],
      ['network','filesystem']
    ]

    return (
      <div id={this.userData['idList']['idRoot']}
           className="MyCalcManagerOverviewChildRootDiv" 
           ref="MyCalcManagerOverviewChildRootDiv">
        <div id={this.userData['idList']['navigationInPageID']}>
          <NavigationInPage ref="NavigationInPage" 
                            headText={CalcManageConf.getNavigationData({
                              pageName:'Overview',
                              type : 'headText'
                            })} 
                            naviTexts={CalcManageConf.getNavigationData({
                              pageName:'Overview',
                              type:'navigationTexts',
                              spaceName:CalcManageConf.getCurSpace(this)
                            })} />
        </div>
        <table className="EchartFatherDiv" id={this.userData['idList']['monitorEchartTableID']}>
          <tbody style={{height:this.state.echartFatherTbodyHeight+'px'}}>
            {layout.map( ( curLine )=>{
              return (
                <tr>
                  {curLine.map( (curIdentify)=>{
                    return (
                      <td>
                        <ResourceMonitorEchart 
                                  ref={curIdentify+'Ref'}
                                  echartTitle={ this.userData['echartTitleText'][curIdentify] } 
                                  echartDivID={ this.userData['echartDivID'][curIdentify] }
                                  echartToolTipFormatterInfo={ this.userData['echartToolTipFormatterInfo'][curIdentify] }
                                  requestMonitorDataCallBackFunc={ this.userData['requestMonitorDataCallBackFunc'][curIdentify] }
                                  dataRangeMinutes={dataRangeMinutes} />
                      </td>
                    )
                  } )}
                </tr>
              )
            } )}
          </tbody>
        </table>
        <AutoLayoutDiv layoutInfos={this.userData['layoutInfoArr']} />
      </div>
    )
  }
});


export default mod;