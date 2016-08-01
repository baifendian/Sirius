import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabManager from './Manager'
import TabMonitor from './Monitor'
import Fetch from 'bfd-ui/lib/Fetch'


export default React.createClass({
  sliderDataSccuess(data){
    data=[{"name":"bre","value":"300","tickValue":"50","start":0,"end":500},
          {"name":"bae","value":"200","tickValue":"50","start":0,"end":500},
          {"name":"space1","value":"250","tickValue":"50","start":0,"end":500},
          {"name":"space2","value":"100","tickValue":"50","start":0,"end":500},
          {"name":"space3","value":"150","tickValue":"50","start":0,"end":500}];
    this.setState({"sliderData":data});
  },
  getInitialState: function() {
    return {
      "sliderData":[]
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
          <TabPanel><TabMonitor sliderData={this.state.sliderData} /></TabPanel>
          <TabPanel><TabManager sliderData={this.state.sliderData} /></TabPanel>
        </Tabs>
        <div className="div-Fetch">
          <Fetch style={{minHeight:100}} url="v1/hdfs/aaaa/?op=LISTSTATUS" onSuccess={this.sliderDataSccuess}>
          </Fetch>
        </div>
        </div>
    )
  }
})
