import React from 'react'
import ReactDOM from 'react-dom'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabGraph from './Graph'
import TabLiebiao from './Liebiao'
import NavigationInPage from 'public/NavigationInPage'
import Icon from 'bfd-ui/lib/Icon'

//import { Tabs, Icon } from 'antd'


export default React.createClass({
    getInitialState(){
      return {
        imageHeight:0,
        tableHeight:0,
      }
    },

    resetTableImageHeight(){
      let totalHeight = this.calcRootDivHeight()
      if ( this.totalHeight !== totalHeight ){
        ReactDOM.findDOMNode(this.refs.MyTaskRootDiv).style.height = (totalHeight+'px')
        let tabsRootDivHeight = totalHeight - ReactDOM.findDOMNode(this.refs.NavigationInPage).clientHeight
        let imageHeight = tabsRootDivHeight
        let tableHeight = tabsRootDivHeight
        this.setState({
          imageHeight:imageHeight,
          tableHeight:tableHeight
        })
        this.totalHeight = totalHeight
      }
    },

    //动态计算组件高度
    componentDidMount(){
      this.resetTableImageHeight()
      window.onresize = ()=>{ this.onWindowResize() }
    },

    onWindowResize(){
      window.onresize = undefined
      this.resetTableImageHeight()
      window.onresize = ()=>{ this.onWindowResize() }
    },

    calcRootDivHeight(){
      let totalHeight = document.body.clientHeight
      totalHeight -= document.getElementById('header').clientHeight
      totalHeight -= document.getElementById('footer').clientHeight
      totalHeight -= 20*2               // 去掉设置的子页面padding
      return totalHeight
    },


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

      //let tabsPanelHeight = this.calcDesiredHeight()
      
    return (
        <div className='MyTaskRootDiv' ref='MyTaskRootDiv'>
          <NavigationInPage ref='NavigationInPage' headText={headText} naviTexts={navigationTexts}  />
          <div className='cTabs' ref='cTabs' >
 
            <Tabs>
              <TabList>
                <Tab><img src='../../../data/picture.png' /></Tab>
                <Tab><img src='../../../data/bars.png' /></Tab>
              </TabList>
              <TabPanel><TabGraph   height={this.state.imageHeight} /></TabPanel>
              <TabPanel><TabLiebiao height={this.state.tableHeight} /></TabPanel>
            </Tabs>

          </div>
        </div>  	

    )
  }
})