import React from 'react'
//import Task from 'public/Task'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'

import DataTable from 'bfd-ui/lib/DataTable'

export default React.createClass({

   getInitialState: function () {
    return {
      
      test:"启动",
      data_test:"<h1>启动</h1>",
      url: "volumes/",
      column: [/*{
        title:'序号',
        key:'sequence'
      }, */
      {
        title: '名称',
        order: true,
        width: '20%',
        render: (text, item) => {
          return <a href="javascript:void(0);" onClick={this.handleClick.bind(this, item)}>{text}</a>
        },
        key: 'name'
      }, {
        title: '描述',
        key: 'displayDescription',
        order: true
      }, {
        title: '状态',
        key: 'servername',
        order: true
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
    return (
      <div className="function-data-moduleA">
        <div>
          <Button >创建</Button>
          <Button onClick={this.handleOpen} >挂载</Button>
          <Button type="danger" onClick={this.handleOpen_re} >卸载</Button>
          <Button type="danger" style={{float: 'right'}}>删除</Button>
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



/*import React from 'react'
import Task from 'public/Task'

import { Pagination } from 'antd';
//import { Row, Col } from 'bfd/Layout'

export default React.createClass({

 
  handleChange(page){
  	console.log(page)

  },
  render() {
    return (
      <div>
        <h1>ModuleB</h1>
        <Pagination defaultCurrent={1} total={50} onChange={this.handleChange}/>
        <hr/>
        

      </div>

    )
  }
 

})*/