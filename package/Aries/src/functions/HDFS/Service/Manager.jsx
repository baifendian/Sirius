import React from 'react'
import Task from 'public/Task'
import './index.less'
import Head from './Head'
import Top from './Top'
import Bottom from './Bottom'
import Fetch from 'bfd-ui/lib/Fetch'

const TabManager = React.createClass({
  statusDataSccuess(data){
    data = [
            {"hostname":"BFDabc","status":"healthy"},
            {"hostname":"bcd","status":"except"},
            {"hostname":"aaa","status":"healthy"},
            {"hostname":"abc1","status":"healthy"},
            {"hostname":"bcd1","status":"except"},
            {"hostname":"aaa1","status":"healthy"},
            {"hostname":"abc22","status":"healthy"},
            {"hostname":"bcd33","status":"except"},
            {"hostname":"aaa33","status":"except"},
            {"hostname":"a1aa","status":"except"},
            {"hostname":"a33aa","status":"except"},
            {"hostname":"a123aa","status":"except"}
          ];

    let componentData=[
        {"component":"DATANODE","status":"STOP"},
        {"component":"NAMENODE","status":"START"},
        {"component":"ZKFC","status":"STOP"}
          ];

    this.setState({"statusAllData":data,"filterData":data,"componentData":componentData});
  },
  statusFilter(status){
    //主要用于实现状态的过滤. all 则这节返回所有的即可. select 返回选中的节点
    let filterData = [];
    if(status=="all"){
      filterData=this.state.statusAllData;
    }else if(status=="select"){
      //只返回被选中的节点
      filterData = this.state.statusAllData.filter((data)=>{
        if(data["hostname"]==this.state.selectHost){
          return data;
        }
      });
    }else{
      filterData = this.state.statusAllData.filter((data)=>{
        if(data["status"]==status){
          return data;
        }
      });
    }
    this.setState({"filterData":filterData});
  },
  updateData(hostname){
    this.setState({"selectHost":hostname,"operatorType":"COMPONENT"});
  },
  getInitialState: function() {
    return {
      statusAllData:[],
      filterData:[],
      componentData:[],
      selectHost:"服务操作",
      serviceData:[],
      operatorType:"SERVICE",
    };
  },
  render: function(){
    return (
      <div className="service-manage">
        <div>
          <Head statusFilter={this.statusFilter}  />
          <div>
            <Top data={this.state.filterData} updateData={this.updateData} selectHost={this.state.selectHost} />
            <Bottom data={this.state.componentData} operatorType={this.state.operatorType} selectHost={this.state.selectHost} />
          </div>
        </div>
        <div className="div-Fetch">
          <Fetch style={{minHeight:100}} url="v1/hdfs/aaaa/?op=LISTSTATUS" onSuccess={this.statusDataSccuess}>
          </Fetch>
        </div>
      </div>
    );
    }
});
export default TabManager
