import React from 'react'
import ReactDOM from 'react-dom'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import TabGraph from './Graph'
import TabLiebiao from './Liebiao'
import NavigationInPage from 'public/NavigationInPage'
import Icon from 'bfd-ui/lib/Icon'
import CalcManageConf from '../UrlConf'

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
      let spaceName = CalcManageConf.getCurSpace(this);
      
      return (
        <div className='MyTaskRootDiv' ref='MyTaskRootDiv'>
          <NavigationInPage ref='NavigationInPage'
                          headText={CalcManageConf.getNavigationData({
                            moduleName:'OffLineCalcTask',
                            pageName:'MyTask',
                            type : 'headText'
                          })} 
                          naviTexts={CalcManageConf.getNavigationData({
                            moduleName:'OffLineCalcTask',
                            pageName:'MyTask',
                            type:'navigationTexts',
                            spaceName:spaceName
                          })} />
          <div className='cTabs' ref='cTabs' >
 
            <Tabs>
              <TabList>
                <Tab><img src={require('public/TabBar/picture.png')} /></Tab>
                <Tab><img src={require('public/TabBar/bars.png')} /></Tab>
              </TabList>
              <TabPanel><TabGraph   height={this.state.imageHeight} /></TabPanel>
              <TabPanel><TabLiebiao height={this.state.tableHeight} /></TabPanel>
            </Tabs>

          </div>
        </div>  	

    )
  }
})