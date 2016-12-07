import React from 'react'
import ReactDOM from 'react-dom'
import { Tabs, TabList, Tab, TabPanel } from 'bfd/Tabs'
import { Row, Col } from 'bfd/Layout'
import TextOverflow from 'bfd/TextOverflow'
import Icon from 'bfd/Icon'

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
    return this.props.podDetailInfoDict && this.props.podDetailInfoDict['Name']
  },

  // 检查用户当前是否选中了某个 Pod
  checkUserSelectedPod(){
    return this.props.podDetailInfoDict != undefined
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

  // 基本信息需要的函数
  analyseBaseInfo(){
    if ( ! this.checkUserSelectedPod() ){
      return ''
    }

    let podFullInfo = this.props.podDetailInfoDict
    return {
      'containersInfo':this.analyseContainerInfo( podFullInfo ),
      'volumes':this.analyseVolumes( podFullInfo ),
      'volumesMount':this.analyseVolumesMount( podFullInfo )
    }
  },

  // 将所有的volume信息罗列出来
  analyseVolumes( podFullInfo ){
    // 下面几种 volume 格式会被关注，其它的将会被忽视
    let allowedVolumesType = ['rbd','hostPath','emptyDir']
    let podDetail = podFullInfo['DetailInfoDict']
    let volumes = {}
    if (! podDetail['spec']['volumes']){
      return volumes
    }
    for ( let index = 0 ; index < podDetail['spec']['volumes'].length ; index ++ ){
      let volumeInfo = podDetail['spec']['volumes'][index]
      for ( let j = 0 ; j < allowedVolumesType.length ; j ++ ){
        let tStr = allowedVolumesType[j]
        if (volumeInfo[tStr]){
          volumes[volumeInfo['name']] = [tStr,volumeInfo[tStr]]
          break
        }
      }
    }
    return volumes
  },

  // 卷挂载信息
  analyseVolumesMount( podFullInfo ){
    let podDetail = podFullInfo['DetailInfoDict']
    let volumesMount = {}
    for ( let i = 0 ; i < podDetail['spec']['containers'].length ; i ++ ){
      let mountInfo = podDetail['spec']['containers'][i]
      let info = []
      if (mountInfo['volumeMounts']){
        for ( let j = 0 ; j < mountInfo['volumeMounts'].length ; j ++ ){
          let vm = mountInfo['volumeMounts'][j]
          info.push({
            'name':vm['name'],          // 以此和卷信息一一对应
            'path':vm['mountPath'],     // 卷挂载到container的路径
            'readonly':vm['readOnly'] ? 'R' : 'RW'
          })
        }
      }
      volumesMount[ mountInfo['name'] ] = info
    }
    return volumesMount
  },

  // container的基础信息
  analyseContainerInfo( podFullInfo ){
    let containersInfo = []
    let podDetail = podFullInfo['DetailInfoDict']
    for ( let index = 0 ; index < podDetail['status']['containerStatuses'].length ; index ++ ){
      let containerStatus = podDetail['status']['containerStatuses'][index]
      // 最简单的信息
      let info = {
        'name':containerStatus['name'],
        'image':containerStatus['image'],
        'restartCount':containerStatus['restartCount'],
      }
      
      // 运行时刻信息
      if (containerStatus['state']['running']){
        info['state'] = 'running'
        info['age'] = Toolkit.calcAge( containerStatus['state']['running']['startedAt'] )
        info['color'] = 'green'
      } else {
        info['color'] = 'red'
      }
      containersInfo.push(info)
    }
    return containersInfo
  },

  // 由于三个tab页比较复杂， 因此把它们拆出来，形成三个render函数
  render: function (){
    // 如果用户没有选择任何pod，则展示一些信息
    let userUnSelectedPodDetailInfo = [['请选择Pod']]

    return(
      <Tabs ref='RootTab' className="PodDetailRootTab">
        <TabList>
          <Tab>容器基本信息</Tab>
          <Tab>监控</Tab>
          <Tab>详情</Tab>
        </TabList>
        <TabPanel>
          {this.checkUserSelectedPod() ? this.renderBaseInfo() : [ 
            <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                          dynamicTableTextArray={userUnSelectedPodDetailInfo} /> 
          ]}
        </TabPanel>
        <TabPanel>
          {this.checkUserSelectedPod() ? this.renderEcahrtInfo() : [
            <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                        dynamicTableTextArray={userUnSelectedPodDetailInfo} />
          ]}
        </TabPanel>
        <TabPanel>
          {this.checkUserSelectedPod() ? this.renderDetailJsonInfo() : [
            <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                        dynamicTableTextArray={userUnSelectedPodDetailInfo} />
          ]}
        </TabPanel>
      </Tabs>
    )
  },

  renderBaseInfo(){
    let baseInfo = this.analyseBaseInfo()

    /**     
    console.log(baseInfo['volumes'])
    console.log(baseInfo['containersInfo'])
    console.log(baseInfo['volumesMount'])
    */

    // 用来绘制image（镜像）字符串左侧的图标的函数
    let imageIconFunc = ()=>{
      let svgStyleObj = {
        'width':'11px',
        'height':'13px',
        'marginRight':'5px',
        'paddingTop':'2px',
        'display':'inline-block',
      }
      let circleStyleObj1 = {
        'fill':'#FFFFFF',
        'stroke':'#55A8FD',
        'strokeWidth':'18px',
      }
      let circleStyleObj2 = {
        'fill':'#55A8FD',
        'stroke':'#55A8FD',
        'strokeWidth':'1px',
      }
      return (
        <svg style={svgStyleObj} viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
          <circle style={circleStyleObj1} cx="90" cy="90" r="80"/>
          <circle style={circleStyleObj2} cx="90" cy="90" r="27"/>
        </svg>
      )
    }


    return (
      <div className="PodDetailBaseInfo" style={{'height':(this.props.podDetailHeight)+'px'}}>        
        {baseInfo['containersInfo'].map( (container)=>{
          return (
            <table className="ContainerCardTable" border="1">
              <thead>
                <tr>
                  <th colSpan="4">{container['name']}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="ContainerCardTr ContainerCardCommonTr" key={Toolkit.generateGUID()}>
                  <td>{imageIconFunc()}Image</td>
                  <td colSpan="3">
                    <TextOverflow>
                      <p>{container['image']}</p>
                    </TextOverflow>
                  </td>
                </tr>
                <tr className="ContainerCardTr ContainerCardCommonTr" key={Toolkit.generateGUID()}>
                  <td><Icon type="refresh" className="ContainerIcon" />RestartCount</td>
                  <td colSpan="3">
                    <TextOverflow>
                      <p>{container['restartCount']}</p>
                    </TextOverflow>
                  </td>
                </tr>                    
                {baseInfo['volumesMount'][container['name']].map( (vm)=>{
                  let volumeDetailInfo = baseInfo['volumes'][vm['name']]
                  volumeDetailInfo = volumeDetailInfo ? JSON.stringify(volumeDetailInfo) : '未知'
                  return (
                    <tr className="ContainerCardTr ContainerCardVolumeTr" key={Toolkit.generateGUID()}>
                      <td><TextOverflow><p><Icon type="hdd-o" className="ContainerIcon" />{vm['name']}</p></TextOverflow></td>
                      <td><TextOverflow><p>{vm['path']}</p></TextOverflow></td>
                      <td><TextOverflow><p>{volumeDetailInfo}</p></TextOverflow></td>
                      <td>{vm['readonly']}</td>
                    </tr>
                  )
                } )}   
              </tbody>
            </table>
          )
        } )}
      </div>
    )
  },
  renderEcahrtInfo(){
    let podDetail = this.userData['podDetail']    
    return (
      <table className="PodDetailEchartTable" >
        <tbody style={{'height':this.props.podDetailHeight+'px'}}>
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
    )
  },
  renderDetailJsonInfo(){
    let detail = this.props.podDetailInfoDict['DetailInfoStrList']
    let detailInfoToShow = []
    for ( let k = 0 ; k < detail.length ; k ++ ){
      detailInfoToShow.push( [detail[k]] )
    }

    return <DynamicTable dynamicTableHeight={this.props.podDetailHeight-10}
                      dynamicTableTextArray={detailInfoToShow}/>
  }  
})

export default PodDetailElement

