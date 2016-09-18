import React from 'react'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Spin } from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import Openstackconf from '../Conf/Openstackconf'



export default React.createClass({
   getInitialState: function () {
    return {
      loading:false,
      url: "openstack/images/",
      column: [{
        title: '镜像名称',
        order: true,
        width: '200px',
        key: 'name'
      }, {
        title: '类型',
        key: 'type_image',
        order: true
      }, {
        title: '状态',
        key: 'image_status',
        order: true
      }, {
        title: '公有',
        key: 'public',
        order: true
      }, {
        title: '格式',
        key: 'format',
        order:true,
      }, {
        title: '大小',
        key: 'size',
        order: true
      }
      ]
    }
  },
  handleOpen(name) {
    console.log(this.state.images_list)
  },
  requestArgs:{
    pageName : "image",
  },
  render() {
      let spaceName = Openstackconf.getCurSpace(this)
      return (
      <div className="function-data-moduleA">
      <NavigationInPage headText={Openstackconf.getNavigationData({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
      <Spin spinning={this.state.loading}>
      	<div>
          <Button onClick={this.handleOpen.bind(this,5)} style={{float:"left",margin:'0px 10px 0px 0px'}}>刷新</Button>
      	</div>
      		<div>
        	<DataTable
		        url={this.state.url}
		        showPage="true"
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