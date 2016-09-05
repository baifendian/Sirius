import React from 'react'
//import Task from 'public/Task'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import {Create_volumes} from './volumes_create'

import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({

   getInitialState: function () {
    return {      
      test:"启动",
      data_test:"<h1>启动</h1>",
      url: "openstack/volumes/",
      column: [/*{
        title:'序号',
        key:'sequence'
      }, */
      {
        title: '名称',
        order: true,
        //width: '20%',
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
          return (
            <span>已连接到
            <TextOverflow><p style={{width: '100px'}}>{text}</p>
            </TextOverflow></span>)
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
  },
  handleRowClick(row) {
    console.log('rowclick', row)
  },
  handleOrder(name, sort) {
    console.log(name, sort)
  },
  handleOpen() {
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
   handleOpen_re() {
    this.refs.modal.open()
    this.setState({test: "重启"});
    //console.log(this.refs.modal.getDOMNode())
    // console.log(this.refs.modal.reset()

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
          <Button onClick={this.handleOpen} style={{float:'left'}}>刷新</Button>
          <Create_volumes/>
          {/*<Button onClick={this.handleOpen} >创建</Button>
          <Button onClick={this.handleOpen} >挂载</Button>
          <Button type="danger" onClick={this.handleOpen_re} >卸载</Button>*/}
          <Button type="danger" >删除</Button>
          <Modal ref="modal">
              <ModalHeader>
                <h4>{this.state.test}</h4>
              </ModalHeader>
              <ModalBody>
                <div>
                  <h4>您需要删除的机器有test，test2。</h4>
                 </div>
                 <div className="create_host">
                    <Button onClick={this.handleclean}>关闭</Button>
                  <Button>创建</Button>
                 </div>
              </ModalBody>
          </Modal>
        </div>
        <div>
          <DataTable 
            url={this.state.url} 
            onPageChange={this.onPageChange} 
            showPage="true" 
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
