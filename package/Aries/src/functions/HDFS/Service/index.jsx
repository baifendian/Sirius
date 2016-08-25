import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabManager from './Manager'
import TabMonitor from './Monitor'
import HdfsConf from '../Conf/Conf'

export default React.createClass({
  requestArgs:{
    moduleName:"Service",
    type:"",
    hostName:"",
    componentName:"",
    operator:"",
  },
  getUrlData({type="",hostName="",componentName="",operator=""}){
    //直接设置
    this.requestArgs.type = type;
    this.requestArgs.hostName = hostName;
    this.requestArgs.componentName = componentName;
    this.requestArgs.operator = operator;
    return HdfsConf.getUrlData(this.requestArgs);
  },
  render() {
    return (
        <Tabs>
          <TabList>
            <Tab>服务监控</Tab>
            <Tab>服务管理</Tab>
          </TabList>
          <TabPanel><TabMonitor getUrlData={this.getUrlData} /></TabPanel>
          <TabPanel><TabManager getUrlData={this.getUrlData} /></TabPanel>
        </Tabs>
    )
  }
})
