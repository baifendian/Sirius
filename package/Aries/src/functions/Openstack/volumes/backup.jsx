import React from 'react'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import './index.less'
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
      url: OPEN.UrlList()['volumes_post']+'?name=backup',
      column: [{
        title: '名称',
        order: false,
       // width: '200px',
        key: 'displayName'
      }, {
        title: '描述',
        key: 'displayDescription',
        order: false
      }, {
        title: '大小',
        key: 'size',
        order: false
      }, {
        title: '状态',
        key: 'status',
        order: false
      }, {
        title: '硬盘名称',
        key: 'volume_name',
        order:false,
      }, {
        title: '操作',
        key: 'size',
        order: false
      }
      ]
    }
  },
  handleOpen(name) {
    console.log(this.state.images_list)
  },
  requestArgs:{
    pageName : "backup",
  },
  render() {
    let naviTexts = [{  'url':'/','text':'概览'},
      {'url':'','text':'云主机'},  
      {'url':'','text':'计算'},
      {'url':'/CloudHost/Storage/Backup','text':'备份'}]
    let spaceName = Openstackconf.getCurSpace(this)
      return (
      <div className="function-data-moduleA">
      <NavigationInPage headText={Openstackconf.getNavigationDatav({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationDatav({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
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