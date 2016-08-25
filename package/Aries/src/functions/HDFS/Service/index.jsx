import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabManager from './Manager'
import TabMonitor from './Monitor'
import HdfsConf from '../Conf/HdfsConf'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({
  requestArgs:{
    pageName:"Service",
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
    let spaceName = HdfsConf.getCurSpace(this);
    return (
        <div>
          <NavigationInPage headText={HdfsConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={HdfsConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
          <Tabs>
            <TabList>
              <Tab>服务监控</Tab>
              <Tab>服务管理</Tab>
            </TabList>
            <TabPanel><TabMonitor getUrlData={this.getUrlData} /></TabPanel>
            <TabPanel><TabManager getUrlData={this.getUrlData} /></TabPanel>
          </Tabs>
        </div>
    )
  }
})
