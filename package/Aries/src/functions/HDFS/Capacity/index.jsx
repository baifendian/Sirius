import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabManager from './Manager'
import TabMonitor from './Monitor'
import Fetch from 'bfd-ui/lib/Fetch'


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
    console.log(percentData);
    console.log(slider_data);
    this.setState({"sliderData":slider_data,"percentData":percentData});
  },
  getInitialState: function() {
    return {
      "sliderData":[],
      "percentData":[],
    };
  },
  render() {
    return (
       <div>
        <Tabs>
          <TabList>
            <Tab>配额监控</Tab>
            <Tab>配额管理</Tab>
          </TabList>
          <TabPanel><TabMonitor percentData={this.state.percentData} /></TabPanel>
          <TabPanel><TabManager sliderData={this.state.sliderData} /></TabPanel>
        </Tabs>
        <div className="div-Fetch">
          <Fetch style={{minHeight:0}} url="v1/hdfs///?op=SUM" onSuccess={this.sliderDataSccuess}>
          </Fetch>
        </div>
        </div>
    )
  }
})
