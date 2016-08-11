import React from 'react'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabGraph from './Graph'
import TabLiebiao from './Liebiao'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({
  render() {
    let headText = '我的任务'
    let navigationTexts = [{
      'url':'/CalcManage/Overview',
      'text':'计算管理'
    },{
      'url':'/CalcManage/MyTask',
      'text':'我的任务'
    }]
    return (
        <div className='MyTaskRootDiv'>
          <div className='NavigationInPage'>
            <NavigationInPage headText={headText} naviTexts={navigationTexts}  />
          </div>
          <div className='Tabss'>
            <Tabs>
              <TabList className='Tabs'>
                <Tab>图形</Tab>
                <Tab>列表</Tab>
              </TabList>
              <TabPanel><TabGraph /></TabPanel>
              <TabPanel><TabLiebiao /></TabPanel>
            </Tabs>
          </div>
        </div>	

    )
  }
})