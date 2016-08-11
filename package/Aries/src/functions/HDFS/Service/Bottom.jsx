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
        return <Select defaultValue="STARTED" onChange={(state)=>{this.handleChange(state,this.componentData.component)}}>
          <Option value="STARTED">START</Option>
          <Option value="STOP">STOP</Option>
          <Option value="RESTART">RESTART</Option>
        </Select>
    },
    STOPED:function(){
        return <Select defaultValue="STOPED" onChange={(state)=>{this.handleChange(state,this.componentData.component)}}>
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
    let hostName = this.props.selectHost;
    //启动,停止
    let url = `v1/hdfs/${hostName}/${text}/${select}/`;
    console.log(select,text,hostName,url);
    xhr({type: 'POST',url: url,
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
            这里是描述模块
        </div>
      </div>
    </div>
  }
});

export default Bottom;
