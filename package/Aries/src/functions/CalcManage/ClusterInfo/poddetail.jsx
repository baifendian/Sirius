import React from 'react'
import ReactDOM from 'react-dom'
import { Tabs, TabList, Tab, TabPanel } from 'bfd/Tabs'
import Toolkit from 'public/Toolkit/index.js'
import DynamicTable from 'public/DynamicTable'

import './index.less'


var PodDetailElement = React.createClass({

  /** 
  getInitialState: function () {
    this.userData = {}
    return {}
  },*/

  onTabChanged( index,key ){
  },

  generateJsonDisList(){
    if ( this.props.podDetailInfoDict ){
      let detail = this.props.podDetailInfoDict['DetailInfoStrList']
      let detailInfoToShow = []
      for ( let k = 0 ; k < detail.length ; k ++ ){
        detailInfoToShow.push( [detail[k]] )
      }
      return detailInfoToShow
    } else {
      return [['请选择Pod']]
    }
  },


  render: function (){

    return(
      <Tabs ref='RootTab' onChange={this.onTabChanged}>
        <TabList>
          <Tab>基本信息</Tab>
          <Tab>监控</Tab>
          <Tab>详情</Tab>
        </TabList>
        <TabPanel>
          基本指标
        </TabPanel>
        <TabPanel>
          用量
        </TabPanel>
        <TabPanel>
          <DynamicTable ref='DynamicTable' 
                        dynamicTableHeight={this.props.podDetailHeight-15}
                        dynamicTableTextArray={this.generateJsonDisList()}/>
        </TabPanel>
      </Tabs>
    )
  }
})

export default PodDetailElement

