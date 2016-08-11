import React from 'react'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabGraph from './Graph'
import TabLiebiao from './Liebiao'
import NavigationInPage from 'public/NavigationInPage'
import Icon from 'bfd-ui/lib/Icon'

//import { Tabs, Icon } from 'antd'


export default React.createClass({
  render() {
    const TabPane = Tabs.TabPane;
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
          <div className='cTabs'>
 
            <Tabs>
              <TabList>
                <Tab><img src='../../../data/picture.png' /></Tab>
                <Tab><img src='../../../data/bars.png' /></Tab>
              </TabList>
              <TabPanel><TabGraph /></TabPanel>
              <TabPanel><TabLiebiao /></TabPanel>
            </Tabs>

          </div>
        </div>  	

    )
  }
})