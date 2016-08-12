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
      'url':'/',
      'text':'首页'
    },{
      'url':'/CalcManage/Overview',
      'text':'计算管理'
    },{
      'url':'/CalcManage/MyTask',
      'text':'我的任务'
    }]

    for ( let i = 0 ; i < navigationTexts.length ; i ++ ){
      navigationTexts[i]['url'] += location.search
    }

    return (
        <div className='MyTaskRootDiv'>
          <div className='NavigationInPage'>
            <NavigationInPage headText={headText} naviTexts={navigationTexts}  />
          </div>
          <div className='cTabs'>
 
            <Tabs>
              <TabList>
                <Tab><img src={require('public/TabBar/picture.png')} /></Tab>
                <Tab><img src={require('public/TabBar/bars.png')} /></Tab>
              </TabList>
              <TabPanel><TabGraph /></TabPanel>
              <TabPanel><TabLiebiao /></TabPanel>
            </Tabs>

          </div>
        </div>  	

    )
  }
})