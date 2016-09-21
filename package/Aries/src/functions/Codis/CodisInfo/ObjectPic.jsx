import React from 'react'
import LineChart from 'bfd-ui/lib/LineChart'
import Percentage from 'bfd-ui/lib/Percentage'
import './index.less'

const ObjectPic =  React.createClass({
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
    render: function () {
        let pod_percent = this.formatPercent( this.props.piclist.expiredkeysdata,this.props.piclist.allkeysdata )
        let task_percent = this.formatPercent( this.props.piclist.usedmemorydata,this.props.piclist.maxmemorydata)
        return (
            <table className="LineChartFatherDiv">
                <tbody>
                  <tr className="LineText">
                    <td>&nbsp;&nbsp;OP/S</td>
                    <td><div /></td>
                    <td>&nbsp;&nbsp;latency</td>
                  </tr>
                  <tr className="LinePic" >
                    <td style={{width:'600px'}}>
                      <div className="borderclass">
                      <LineChart style={{height: '300px'}} category="date" cols={{ops: 'op/s'}} data={this.props.piclist.ops} />
                      </div>
                    </td>
                    <td style={{width:'50px'}} className="MidTdDiv"><div /></td>
                    <td style={{width:'600px'}}>
                      <div className="borderclass">
                      <LineChart style={{height: '300px'}} category="date" cols={{user: '用户', sales: '销量'}} data={this.props.piclist.latency} />
                      </div>
                    </td>
                  </tr>
                  <tr className="LineText">
                    <td style={{height: '30px'}}></td>
                    <td><div /></td>
                    <td></td>
                  </tr>
                  <tr className="LinePic" >
                    <td style={{width:'500px'}} className="percentage">
                      <Percentage percent={pod_percent}
                          foreColor={this.selectColorByPercent(pod_percent)}
                          textColor={this.selectColorByPercent(pod_percent)}
                          style={{width: '150px'}}
                          ref="pod_percent" />
                    </td>
                    <td style={{width:'30px'}} className="MidTdDiv"><div /></td>
                    <td style={{width:'500px'}} className="percentage">
                      <Percentage percent={task_percent}
                          foreColor={this.selectColorByPercent(task_percent)}
                          textColor={this.selectColorByPercent(task_percent)}
                          style={{width: '150px'}}
                          ref="task_percent" />
                    </td>
                  </tr>
                  <tr className="PercentText">
                    <td className="percentage">expired keys</td>
                    <td style={{width:'30px'}} className="MidTdDiv"><div /></td>
                    <td className="percentage">memory used</td>
                  </tr>
                  <tr className="PercentDetail">
                    <td className="percentage">{this.props.piclist.expiredkeysdata}&nbsp;/&nbsp;{this.props.piclist.allkeysdata}</td>
                    <td style={{width:'30px'}} className="MidTdDiv"><div /></td>
                    <td className="percentage">{this.props.piclist.usedmemorydata}G&nbsp;/&nbsp;{this.props.piclist.maxmemorydata}G</td>
                  </tr>
                </tbody>
            </table>
        )
    }
})

export default ObjectPic