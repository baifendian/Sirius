import React from 'react'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Spin } from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import Openstackconf from '../Conf/Openstackconf'
import ReactDOM from 'react-dom'


export default React.createClass({
   getInitialState: function () {
    return {
      loading:false,
      url: "openstack/images/",
      column: [{
        title: '镜像名称',
        order: false,
        key: 'name'
      }, {
        title: '类型',
        key: 'type_image',
        order: false
      }, {
        title: '状态',
        key: 'image_status',
        order: false
      }, {
        title: '公有',
        key: 'public',
        order: false
      }, {
        title: '格式',
        key: 'format',
        order:false,
      }, {
        title: '大小',
        key: 'size',
        order: false,
        width: "17%"
      }
      ]
    }
  },
  handleOpen(name) {
    console.log(this.state.images_list)
  },
  componentDidMount(){
    console.log(document.body.clientHeight)
    console.log(ReactDOM.findDOMNode(this.refs.images_nav).clientHeight)
    console.log(ReactDOM.findDOMNode(this.refs.images_bu).clientHeight)
    let totalHeight = document.body.clientHeight
   // let totalwidth=1053.36-20
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let images_nav = ReactDOM.findDOMNode(this.refs.images_nav).clientHeight
    let images_bu = ReactDOM.findDOMNode(this.refs.images_bu).clientHeight
    totalHeight = totalHeight - images_nav - images_bu - 110
    ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    //ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.width=totalwidth+'px'
    //ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].style.width=totalwidth+'px'
    console.log(totalHeight,images_bu,images_nav)
  },
  requestArgs:{
    pageName : "image",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this);
      return (
      <div className="function-data-moduleA">
      <NavigationInPage ref="images_nav" headText={Openstackconf.getNavigationData({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
      <Spin spinning={this.state.loading}>
      	<div ref="images_bu">
          <Button onClick={this.handleOpen.bind(this,5)} style={{margin:'0px 10px 0px 0px'}}>刷新</Button>
      	</div>
      	<div className="DataTableFatherDiv_images">
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