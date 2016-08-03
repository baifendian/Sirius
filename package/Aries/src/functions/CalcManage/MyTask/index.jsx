import React from 'react'
//import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabGraph from './Graph'
import TabLiebiao from './Liebiao'
import NavigationInPage from 'public/NavigationInPage'
import { Tabs, Icon } from 'antd'

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
 
            <Tabs defaultActiveKey="1">
              <TabPane tab={<span><Icon type="picture" /></span>} key="1"><TabGraph /></TabPane>
              <TabPane tab={<span><Icon type="bars" /></span>} key="2"><TabLiebiao /></TabPane>
            </Tabs>

          </div>
        </div>  	

    )
  }
})