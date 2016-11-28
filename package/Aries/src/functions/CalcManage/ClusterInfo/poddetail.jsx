import React from 'react'
import ReactDOM from 'react-dom'
import { Tabs, TabList, Tab, TabPanel } from 'bfd/Tabs'

import Toolkit from 'public/Toolkit/index.js'
import DynamicTable from 'public/DynamicTable'
import ResourceMonitorEchart from 'public/ResourceMonitorEchart'

import CMDR from '../CalcManageDataRequester/requester.js'

import './poddetail.less'


var PodDetailElement = React.createClass({

  componentWillMount(){
    this.userData = {}
    this.initPodDetailData()
  },

  componentDidUpdate(){
    this.reloadEchartData()
  },

  componentDidMount(){
    window.addEventListener('resize',this.adjustEchartSize)
  },

  // 获取 Pod 的名字
  getPodName(){
    //return Toolkit.generateGUID()
    return this.props.podDetailInfoDict && this.props.podDetailInfoDict['Name']
  },

  // 检查用户当前是否选中了某个 Pod
  checkUserSelectedPod(){
    return this.props.podDetailInfoDict != undefined
  },

  // 详情 TabPanel 中使用的数据
  generateJsonDisList(){
    let detail = this.props.podDetailInfoDict['DetailInfoStrList']
    let detailInfoToShow = []
    for ( let k = 0 ; k < detail.length ; k ++ ){
      detailInfoToShow.push( [detail[k]] )
    }
    return detailInfoToShow
  },

  // 重新加载 监控 数据
  reloadEchartData(){
    let newestNameSpace = this.props.spaceName
    let newestPodName = this.getPodName()
    if ( this.getPodName() ){
      if ( (this.userData['curNameSpace'] != newestNameSpace) || (this.userData['curPodName'] != newestPodName) ){
        this.userData['curNameSpace'] = newestNameSpace        
        this.userData['curPodName'] = newestPodName
        for ( let i = 0 ; i < this.userData['podDetail']['resourceTypes'].length ; i ++ ){
          let refKey = this.userData['podDetail']['resourceTypes'][i]+'Ref'
          this.refs[refKey] && this.refs[refKey].reloadEchartData()
        }
      }
    }
  },

  // 重新调整 监控 的echart图的大小
  adjustEchartSize(){
    for ( let i = 0 ; i < this.userData['podDetail']['resourceTypes'].length ; i ++ ){
      let refKey = this.userData['podDetail']['resourceTypes'][i] + 'Ref'
      this.refs[refKey] && this.refs[refKey].resizeEchart()
    }
  },

  // 监控 TabPanel 需要使用的一些数据结构
  initPodDetailData(){
    this.userData['podDetail'] = {}
    
    this.userData['podDetail']['dataRangeMinutes'] = [
      {'value':60,   'disStr':'最近1小时'},
      {'value':60*6, 'disStr':'最近6小时'},
      {'value':60*24,'disStr':'最近1天'}
    ]

    this.userData['podDetail']['layout'] = [
      ['cpu','memory'],
      ['network','filesystem']
    ]

    this.userData['podDetail']['resourceTypes'] = ['cpu','memory','network','filesystem']
    
    this.userData['podDetail']['echartDivID'] = {
      'cpu':'EchartCPUInfoDiv',
      'memory':'EchartMemoryInfoDiv',
      'network':'EchartNetworkInfoDiv',
      'filesystem':'EchartFilesystemInfoDiv'
    }

    this.userData['podDetail']['echartTitleText'] = {
      'cpu':'CPU',
      'memory':'Memory',
      'network':'Network',
      'filesystem':'Filesystem'
    }

    // 将url请求与回调都放到一起，便于管理
    this.userData['podDetail']['requestMonitorDataCallBackFunc'] = {
      'cpu':        ( value,dataCallBack )=>{ CMDR.getPodDetailCPUInfo( this.props.spaceName,this.getPodName(),value,dataCallBack) },
      'memory':     ( value,dataCallBack )=>{ CMDR.getPodDetailMemoryInfo( this.props.spaceName,this.getPodName(),value,dataCallBack) },
      'network':    ( value,dataCallBack )=>{ CMDR.getPodDetailNetworkInfo( this.props.spaceName,this.getPodName(),value,dataCallBack) },
      'filesystem': ( value,dataCallBack )=>{ CMDR.getPodDetailFilesystemInfo( this.props.spaceName,this.getPodName(),value ,dataCallBack) },
    }

    this.userData['podDetail']['echartToolTipFormatterInfo'] = {
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

  render: function (){
    // 如果用户没有选择任何pod，则展示一些信息
    let userUnSelectedPodDetailInfo = [['请选择Pod']]

    let podDetail = this.userData['podDetail']

    return(
      <Tabs ref='RootTab' className="PodDetailRootTab">
        <TabList>
          <Tab>基本信息</Tab>
          <Tab>监控</Tab>
          <Tab>详情</Tab>
        </TabList>
        <TabPanel>
          {this.checkUserSelectedPod() ? [
            '基本指标'
          ]:[
            <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                        dynamicTableTextArray={userUnSelectedPodDetailInfo} />
          ]}
        </TabPanel>
        <TabPanel>
          {this.checkUserSelectedPod() ? [
            <table className="PodDetailEchartFatherDiv" >
              <tbody style={{height:this.props.podDetailHeight+'px'}}>
                {podDetail['layout'].map( ( curLine )=>{
                  return (
                    <tr>
                      {curLine.map( (curIdentify)=>{
                        return (
                          <td>
                            <ResourceMonitorEchart 
                                      ref={curIdentify+'Ref'}
                                      echartTitle={ podDetail['echartTitleText'][curIdentify] } 
                                      echartDivID={ podDetail['echartDivID'][curIdentify] }
                                      echartToolTipFormatterInfo={ podDetail['echartToolTipFormatterInfo'][curIdentify] }
                                      requestMonitorDataCallBackFunc={ podDetail['requestMonitorDataCallBackFunc'][curIdentify] }
                                      dataRangeMinutes={podDetail['dataRangeMinutes']} />
                          </td>
                        )
                      } )}
                    </tr>
                  )
                } )}
              </tbody>
            </table>
          ]:[
            <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                        dynamicTableTextArray={userUnSelectedPodDetailInfo} />
          ]}
        </TabPanel>
        <TabPanel>
          {/** 这里之所以分开写是为了方便看代码 */}
          {this.checkUserSelectedPod() ? [
            <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                        dynamicTableTextArray={this.generateJsonDisList()}/>
          ]:[
            <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                        dynamicTableTextArray={userUnSelectedPodDetailInfo} />
          ]}
        </TabPanel>
      </Tabs>
    )
  }
})

export default PodDetailElement

