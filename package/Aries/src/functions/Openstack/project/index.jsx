import React from 'react'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
//import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Spin } from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import OPEN from '../data_request/request.js'
import Openstackconf from '../Conf/Openstackconf'



export default React.createClass({
   getInitialState: function () {
    return {
      loading:false,
      url: OPEN.UrlList()['project'],
      column: [{
        title: '名称',
        order: false,
       // width: '200px',
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
        order: false
      }
      ]
    }
  },
  handleOpen(name) {
    console.log(this.state.images_list)
  },
  requestArgs:{
    pageName : "project",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this)
      return (
      <div className="function-data-moduleA">
      <NavigationInPage headText={Openstackconf.getNavigationDatap({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationDatap({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
      <Spin spinning={this.state.loading}>
      	<div>
          <Button onClick={this.handleOpen.bind(this,5)} style={{float:"left",margin:'0px 10px 0px 0px'}}>刷新</Button>
      	</div>
      		<div>
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