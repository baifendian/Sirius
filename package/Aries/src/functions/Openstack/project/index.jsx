import React from 'react'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Spin } from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import OPEN from '../data_request/request.js'
import ReactDOM from 'react-dom'
import Openstackconf from '../Conf/Openstackconf'



export default React.createClass({
   getInitialState: function () {
    return {
      loading:false,
      url: OPEN.UrlList()['project'],
      column: [{
        title: '名称',
        order: false,
        key: 'name'
      }, {
        title: '描述',
        key: 'desc',
        order: false
      }, {
        title: '项目ID',
        key: 'id',
        order: false
      }, {
        title: '域名',
        key: 'domain_name',
        order: false,
      //  width: "26.25%"
      }
      ]
    }
  },
  handleOpen(name) {
    console.log(this.state.images_list)
  },
  componentDidMount(){
    console.log(document.body.clientHeight)
    let totalHeight = document.body.clientHeight
    //let totalwidth=1053.36-21.18
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let project_nav = ReactDOM.findDOMNode(this.refs.project_nav).clientHeight
    let project_bu = ReactDOM.findDOMNode(this.refs.project_bu).clientHeight
    totalHeight = totalHeight - project_nav - project_bu - 120
    ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    //ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.width=totalwidth+'px'
  },
  requestArgs:{
    pageName : "project",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this)
      return (
      <div className="function-data-moduleA">
      <NavigationInPage ref="project_nav" headText={Openstackconf.getNavigationDatap({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationDatap({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
      <Spin spinning={this.state.loading}>
      	<div ref="project_bu">
          <Button onClick={this.handleOpen.bind(this,5)} style={{margin:'0px 10px 0px 0px'}}>刷新</Button>
      	</div>
      		<div className="DataTableFatherDiv_project">
        	<DataTable
		        url={this.state.url}
		        showPage="false"
		        column={this.state.column}
		        howRow={10}
		        onOrder={this.handleOrder}
		        onCheckboxSelect={this.handleCheckboxSelect}  ref="Table">
		      </DataTable>
		      </div>
          </Spin>
      </div>
    )
  }
})