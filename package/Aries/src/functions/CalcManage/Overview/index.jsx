import React from 'react'
import Percentage from 'bfd-ui/lib/Percentage'
import LineChart from 'bfd-ui/lib/LineChart'
import NavigationInPage from 'public/NavigationInPage'
import './index.less'

import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'

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
          <table className="PercentageFatherDiv">
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
          <table className="LineChartFatherDiv">
            <tbody>
              <tr className="LineText">
                <td>负载</td>
                <td><div /></td>
                <td>流量</td>
              </tr>
              <tr className="LinePic" >
                <td style={{width:'450px'}}>
                  <LineChart style={{height: '240px'}} category="date" cols={{user: '用户', sales: '销量'}} data={this.state.load_data_points} />
                </td>
                <td className="MidTdDiv"><div /></td>
                <td style={{width:'450px'}}>
                  <LineChart style={{height: '240px'}} category="date" cols={{user: '用户', sales: '销量'}} data={this.state.flowrate_data_points} />
                </td>
              </tr>
            </tbody>
          </table>
      </div>
    )
  }
});


export default mod;