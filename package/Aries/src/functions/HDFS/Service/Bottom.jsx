import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Select, Option } from 'bfd-ui/lib/Select2'
import Button from 'bfd-ui/lib/Button'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'

const Bottom = React.createClass({
  componentState:{
    STARTED:function(){
        return <Select defaultValue="START" onChange={(state)=>{this.handleChange(state,this.componentData.component)}}>
          <Option value="START">START</Option>
          <Option value="STOP">STOP</Option>
          <Option value="RESTART">RESTART</Option>
        </Select>
    },
    STOPED:function(){
        return <Select defaultValue="STOP" onChange={(state)=>{this.handleChange(state,this.componentData.component)}}>
                  <Option value="STOP">STOP</Option>
                  <Option value="START">START</Option>
              </Select>
    },
    INSTALLED:function(){
        return <Select defaultValue="INSTALLED" onChange={(state)=>{this.handleChange(state,this.componentData.component)}}>
                  <Option value="INSTALLED">INSTALLED</Option>
                  <Option value="START">START</Option>
              </Select>
    }
  },
  operatorType:{
    SERVICE:function(){
      return <div className="service">
                <Button className="service-bt" >rebalance</Button>
            </div>;
    },
    COMPONENT:function(){
      //组件相关信息
      let selectData = this.props.data;
      let selectComponents = selectData.map((data)=>{
          this.componentData = data;
          let component =<div className="component">
                  <div className="left">
                    {data.component}
                  </div>
                  <div className="right">
                    {this.componentState[data.state].call(this)}
                  </div>
                </div>
           return component;
         });
      return selectComponents
    }
  },
  handleChange(select,text){
    //启动,停止
    let operatorUrl = this.props.getUrlData({ type : "OPERATOR",
                                              hostName : this.props.selectHost,
                                              componentName : text,
                                              operator : select
                                             });
    xhr({type: 'POST',url: operatorUrl,
      success(data) {
        message.success(data)
      }
    })
  },
  render:function(){
    return <div className="bottom">
      <div className="left">
        <div className="title">
            {this.props.selectHost}
        </div>
        <div className="desc">
            {this.operatorType[this.props.operatorType].call(this)}
        </div>
      </div>
      <div className="right">
        <div className="title">
            主机描述
        </div>
        <div className="desc">
          <table className="HostInfoTable">
            <tr><td>Host Name:  </td>  <td>{this.props.hostInfo.host_name}          </td> </tr>
            <tr><td>IP:         </td>  <td>{this.props.hostInfo.ip}                 </td> </tr>
            <tr><td>OS:         </td>  <td>{this.props.hostInfo.os}                 </td> </tr>
            <tr><td>Cores(CPU): </td>  <td>{this.props.hostInfo.cpu_count}          </td> </tr>
            <tr><td>Memory:     </td>  <td>{this.props.hostInfo.total_mem}          </td> </tr>
            <tr><td>Load Avg:   </td>  <td>{this.props.hostInfo.load_avg}           </td> </tr>
            <tr><td>Heartbeat:  </td>  <td>{this.props.hostInfo.last_heartbeat_time}</td> </tr>
          </table>
        </div>
      </div>
    </div>
  }
});

export default Bottom;
