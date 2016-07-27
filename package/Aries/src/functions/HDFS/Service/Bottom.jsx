import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Select, Option } from 'bfd-ui/lib/Select2'
import Button from 'bfd-ui/lib/Button'

const Bottom = React.createClass({
  operatorType:{
    SERVICE:function(){
      return <div className="service">
                <Button className="service-bt">rebalance</Button>
                <Button className="service-bt">rebalance1</Button>

            </div>;
    },
    COMPONENT:function(){
      //组件相关信息
      let selectData = this.props.data;
      let selectComponents = selectData.map((data)=>{
          let component =<div className="component">
                  <div className="left">{data.component}</div>
                  <div className="right">
                    <Select defaultValue={data.status} onChange={()=>{this.handleChange(data.name,data.component)}}>
                      <Option value="START">START</Option>
                      <Option value="STOP">STOP</Option>
                      <Option value="RESTART">RESTART</Option>
                    </Select>
                  </div>
                </div>
           return component;
         });
      return selectComponents
    }
  },
  handleChange(select,text){
    console.log(select,text);
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
