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
import ReactDOM from 'react-dom'
import TextOverflow from 'bfd/TextOverflow'



export default React.createClass({
   getInitialState: function () {
    return {
      loading:false,
      url: OPEN.UrlList()['volumes_post']+'?name=backup',
      column: [{
        title: '名称',
        order: false,
        key: 'displayName'
      }, {
        title: '描述',
        key: 'displayDescription',
        order: false
      }, {
        title: '大小',
        key: 'size',
        order: false,
        render: (text, item) => {
          return (
            <div>
              <TextOverflow><p style={{width: '204px'}}>{text}GB</p>
              </TextOverflow>
            </div>)
        }
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
        order: false,
     //   width: "18.25%"
      }
      ]
    }
  },
  handleOpen(name) {
    console.log(this.state.images_list)
  },
  componentDidMount(){
    let table_trlengt=ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totallength=ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].childNodes.length
    let tdheight=ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].scrollHeight
    let height_table=(totallength)*tdheight
    let totalwidth=(ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].clientWidth-17)/table_trlengt
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let backup_nav = ReactDOM.findDOMNode(this.refs.backup_nav).clientHeight
    let backup_bu = ReactDOM.findDOMNode(this.refs.backup_bu).clientHeight
    totalHeight = totalHeight - backup_nav - backup_bu - 120
     if (totalHeight>height_table){
      ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    }else{
      ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    for (let i in ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes){
      if (i==(table_trlengt-1)){
        totalwidth=totalwidth+17
        ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width=totalwidth+'px'
      }else{
        ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width=totalwidth+'px'
      }
    }
  }
  },
  requestArgs:{
    pageName : "backup",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this)
      return (
      <div className="function-data-moduleA">
      <NavigationInPage ref="backup_nav" headText={Openstackconf.getNavigationDatav({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationDatav({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
      <Spin spinning={this.state.loading}>
      	<div ref="backup_bu">
          <Button onClick={this.handleOpen.bind(this,5)} style={{margin:'0px 10px 0px 0px'}}>刷新</Button>
      	</div>
      	<div className="DataTableFatherDiv_backup">
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