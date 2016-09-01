import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabManager from './Manager'
import TabMonitor from './Monitor'

export default React.createClass({
  render() {
    return (
        <Tabs>
          <TabList>
            <Tab>服务监控</Tab>
            <Tab>服务管理</Tab>
          </TabList>
          <TabPanel><TabMonitor /></TabPanel>
          <TabPanel><TabManager /></TabPanel>
        </Tabs>
    )
  }
})
