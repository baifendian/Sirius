import React from 'react'
import Task from 'public/Task'
import './index.less'
import Head from './Head'
import Top from './Top'
import Bottom from './Bottom'
import Fetch from 'bfd-ui/lib/Fetch'
import xhr from 'bfd-ui/lib/xhr'

const TabManager = React.createClass({
  statusDataSccuess(data){
    console.log(data);
    let healthyHost = data.healthy.map(function(hostname){
                          return {"hostname":hostname,"status":"healthy"}
                      });
    let exceptHost = data.except.map(function(hostname){
                          return {"hostname":hostname,"status":"except"}
                      });
    let allHost = healthyHost.concat(exceptHost);
    this.setState({"statusAllData":allHost,"filterData":allHost});
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
  updateData(hostName){
    //获取当前hostname上面组件内容
    let componentUrl = this.props.getUrlData({ type : "COMPONENT_INFO",
                                               hostName : hostName
                                              });
    xhr({
      type: 'GET',
      url: componentUrl,
      success:data=> {
        console.log(data)
        this.setState({"selectHost":hostName,"operatorType":"COMPONENT","componentData":data});
      }
    });
    let hostinfoUrl = this.props.getUrlData({ type: "HOST_INFO", hostName: hostName});
    xhr({
      type: 'GET',
      url: hostinfoUrl,
      success:data=> {
        this.setState({"hostInfo":data})
      }
    })

  },
  getInitialState: function() {
    return {
      statusAllData:[],
      filterData:[],
      componentData:[],
      selectHost:"服务操作",
      serviceData:[],
      operatorType:"SERVICE",
      hostInfo: {},
    };
  },
  render: function(){
    let stateUrl = this.props.getUrlData({type : "STATE"});
    return (
      <div className="service-manage">
        <div>
          <Head statusFilter={this.statusFilter}  />
          <div>
            <Top data={this.state.filterData} updateData={this.updateData} selectHost={this.state.selectHost} />
            <Bottom getUrlData={this.props.getUrlData} hostInfo={this.state.hostInfo} data={this.state.componentData} operatorType={this.state.operatorType} selectHost={this.state.selectHost} />
          </div>
        </div>
        <div className="div-Fetch">
          <Fetch style={{minHeight:0}} url={stateUrl} onSuccess={this.statusDataSccuess}>
          </Fetch>
        </div>
      </div>
    );
  }
});
export default TabManager
