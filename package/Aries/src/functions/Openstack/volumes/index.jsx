import React from 'react'
//import Task from 'public/Task'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import {Create_volumes} from './volumes_create'
import {Delete_volumes} from './volumes_delete'

import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import { SplitPanel, SubSplitPanel } from 'bfd/SplitPanel'
import OPEN from '../data_request/request.js'
import ReactDOM from 'react-dom'
import Model_list from './volumes_model_list'

export default React.createClass({

   getInitialState: function () {
    return {      
      url: "openstack/volumes/",
      select_all:'',
      column: [
      {
        title: '名称',
        order: true,
        render: (text, item) => {
          return (<a href="javascript:void(0);" onClick={this.handleClick.bind(this, item)}>
            <TextOverflow><p style={{width: '100px'}}>{text}</p>
            </TextOverflow></a>)
        },
        key: 'name'
      }, {
        title: '描述',
        key: 'displayDescription',
        order: true
      }, {
        title: '状态',
        key: 'servername',
        order: true,
        render: (text, item) => {
          if (text){
            return (<span>已连接到<TextOverflow><p style={{width: '100px'}}>{text}</p></TextOverflow></span>)
          }else{
            return(<span>未连接</span>)
          }
        }
      }, {
        title: '盘符',
        key: 'device'      
      }, {
        title: '容量',
        key: 'size'
      }, {
        title: '类型',
        key: 'voumetype',
        order: true
      }, {
        title: '备份时间',        
        order:true,
        key: 'backupd'
      },
      {
        title: '创建时间',        
        order:true,
        key: 'created'
      }
      ]
    }
  },
  handleClick(item, event) {
    event = event ? event : window.event;
    event.stopPropagation();
    console.log(item)
  }, 
  onPageChange(page) {
     //TODO
     console.log('aaaaa')
  },
  handleCheckboxSelect(selectedRows) {
    console.log('rows:', selectedRows)
    //console.log(selectedRows.html())
    for (var i=0; i<selectedRows.length;i++){
      console.log(selectedRows[i]['id'])
    }
    this.setState({select_all:selectedRows})
  },
  handleRowClick(row) {
    console.log('rowclick', row)
  },
  handleOrder(name, sort) {
    console.log(name, sort)
  },
  refresh(){
    OPEN.update_url(this,"volumes")
  },
  handleOpen() {
    //console.log(ReactDOM.findDOMNode( this.refs.data_table ))
    let aa=ReactDOM.findDOMNode( this.refs.data_table )
    console.log(aa.childNodes[1].childNodes[1])
    //aa.childNodes[1].childNodes[1].style.height="100px"
    //aa.childNodes[1].childNodes[1].style.overflow="auto"
    this.refs.modal.open()
    //console.log(this.refs.modal.getDOMNode())
    // console.log(this.refs.modal.reset())
    console.log(this)
  },
   handleclean() {
    //this.refs.modal.open()
    //console.log(this.refs.modal.getDOMNode())
    // console.log(this.refs.modal.reset()
    this.refs.modal.close()
  },
  delete(){
    console.log('select_all',this.state.select_all)
    OPEN.volumes_data(this,this.state.select_all)
  },
  render() {
      let naviTexts = [{  'url':'/','text':'概览'},
        {'url':'','text':'云主机'},
        {'url':'','text':'计算'},
        {'url':'/openstack/volumes/','text':'磁盘列表'}]
    return (  
      <div className="function-data-moduleA">
        <NavigationInPage naviTexts={naviTexts} headText="openstack" />
        <div>
          <Button onClick={this.refresh} style={{float:'left'}}>刷新</Button>
          <Create_volumes/>
          <Delete_volumes select_all={this.state.select_all}/>
          <Model_list/>
        </div>
        <div className="DataTableFatherDiv">
          <DataTable ref="data_table"
            url={this.state.url} 
            onPageChange={this.onPageChange} 
            showPage='false' 
            column={this.state.column} 
            howRow={8}
            onRowClick={this.handleRowClick}
            onOrder={this.handleOrder}
            onCheckboxSelect={this.handleCheckboxSelect} >
          </DataTable>
        </div>
      </div>
    )
  }
})
