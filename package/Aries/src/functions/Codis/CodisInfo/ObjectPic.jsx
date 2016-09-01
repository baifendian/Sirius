import React from 'react'
import LineChart from 'bfd-ui/lib/LineChart'
import Percentage from 'bfd-ui/lib/Percentage'
import './index.less'

const ObjectPic =  React.createClass({
    render: function () {
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
                      <LineChart style={{height: '300px'}} category="date" cols={{ops: 'op/s'}} data={result} />
                      </div>
                    </td>
                    <td style={{width:'50px'}} className="MidTdDiv"><div /></td>
                    <td style={{width:'600px'}}>
                      <div className="borderclass">
                      <LineChart style={{height: '300px'}} category="date" cols={{user: '用户', sales: '销量'}} data={result} />
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
                      <Percentage percent={pod_percent}
                          foreColor={this.selectColorByPercent(pod_percent)}
                          textColor={this.selectColorByPercent(pod_percent)}
                          style={{width: '150px'}}
                          ref="pod_percent" />
                    </td>
                  </tr>
                  <tr className="PercentText">
                    <td className="percentage">expired keys</td>
                    <td style={{width:'30px'}} className="MidTdDiv"><div /></td>
                    <td className="percentage">memory used</td>
                  </tr>
                  <tr className="PercentDetail">
                    <td className="percentage">243434&nbsp;/&nbsp;432423443</td>
                    <td style={{width:'30px'}} className="MidTdDiv"><div /></td>
                    <td className="percentage">243434&nbsp;/&nbsp;432423443</td>
                  </tr>
                </tbody>
            </table>
        )
    }
})

export default ObjectPic