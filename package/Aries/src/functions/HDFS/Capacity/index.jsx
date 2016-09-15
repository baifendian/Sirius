import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabManager from './Manager'
import TabMonitor from './Monitor'
import Fetch from 'bfd-ui/lib/Fetch'
import HdfsConf from '../Conf/HdfsConf'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({
  sliderDataSccuess(data){
    let percentData = data;
    let slider_data=data.map((d,index)=>{
      return {
              "name":d.name,
              "value":d.total_capacity,
              "start":0,
              "end":d.plan_capacity,
              }
    });
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
