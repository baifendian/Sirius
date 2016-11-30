import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabManager from './Manager'
import TabMonitor from './Monitor'
import Fetch from 'bfd-ui/lib/Fetch'
import HdfsConf from '../Conf/HdfsConf'
import NavigationInPage from 'public/NavigationInPage'
import auth from 'public/auth'

export default React.createClass({
  unit:["GB","TB","PB"],
  converUnit(value,unitIndex){
    //默认是GB. 如果满足TB则直接换算成TB.(plan, total)
    if(value/1024.0 > 1){
      //可以进行转换
      return this.converUnit(value/1024.0,unitIndex+1);
    }
    return {value:value,index:unitIndex}
  },
  sliderDataSccuess(data){
    let percentData = data;
    let slider_data=data.map((d,index)=>{
      let finalUnit = this.converUnit(d.plan_capacity,0);
      let unit = this.unit[finalUnit.index];
      let total_capacity = d.plan_capacity/1024.0*(finalUnit.index+1);
      let end = finalUnit.value;
      return {
              "name":d.name,
              "value":total_capacity.toFixed(2), // 已经分配的空间
              "start":0,
              "end":end.toFixed(0), // 计划使用的空间
              "unit":unit,
              }
    },this);
    this.setState({sliderData:slider_data,percentData:percentData});
  },
  getInitialState: function() {
    return {
      sliderData:[],
      percentData:[],
      random:0,
    };
  },
  refreshCapacity(){
    //通过产生随机数的方式,刷新配额管理.
    let random = parseInt(Math.random()*100000);
    this.setState({random:random});
  },
  requestArgs:{
    pageName:"Capacity",
    type:"",
    spaceName:"",
  },
  getUrlData({type="",spaceName=""}){
    this.requestArgs.type = type;
    this.requestArgs.spaceName = spaceName;
    return HdfsConf.getUrlData(this.requestArgs);
  },
  render() {
    let spaceName = HdfsConf.getCurSpace(this);
    let sumUrl = this.getUrlData({ type : "SUM",
                                 });
    return (
       <div>
       <NavigationInPage headText={HdfsConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={HdfsConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
        <div className="bottom">
          <Tabs>
            <TabList>
              <Tab>配额监控</Tab>
              <Tab>配额管理</Tab>
            </TabList>
            <TabPanel><TabMonitor percentData={this.state.percentData} /></TabPanel>
            <TabPanel><TabManager getUrlData={this.getUrlData} refreshCapacity={this.refreshCapacity} sliderData={this.state.sliderData} /></TabPanel>
          </Tabs>
        </div>
        <div className="div-Fetch">
          <Fetch style={{minHeight:0}} url={`${sumUrl}&random=${this.state.random}`} onSuccess={this.sliderDataSccuess}>
          </Fetch>
        </div>
      </div>
    )
  }
})
