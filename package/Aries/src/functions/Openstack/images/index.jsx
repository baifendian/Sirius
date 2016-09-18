import React from 'react'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Spin } from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'



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


  render() {
    let naviTexts = [{  'url':'/','text':'概览'},
      {'url':'','text':'云主机'},  
      {'url':'','text':'计算'},
      {'url':'/CloudHost/Calculation/Images','text':'镜像'}]
      return (
      <div className="function-data-moduleA">
      <NavigationInPage naviTexts={naviTexts} headText="openstack" />
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