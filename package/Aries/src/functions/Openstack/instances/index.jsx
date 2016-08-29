import React from 'react'
//import Task from 'public/Task'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Dropdown, DropdownToggle, DropdownMenu } from 'bfd-ui/lib/Dropdown'
import xhr from 'bfd-ui/lib/xhr'
import { Spin } from 'antd'

import OPEN from '../data_request/request.js'

import DataTable from 'bfd-ui/lib/DataTable'
import message from 'bfd-ui/lib/message'
import {Extend,Create_model,Progress_model}from './extend'
import {Disk_model} from './model_list'

//import Model_host from './Model_host'
export default React.createClass({
   getInitialState: function () {
    return {
    	text_text:"",
    	host_list:[],
      host_list_id:[],
      host_status:'',
      host_post:'',
      loading:false,
      select_all:[],
      button_status:"disabled",
    	url: "bfddashboard/instances/",
      column: [{
        title:'序号',
        key:'sequence'
      }, {
        title: '名称',
        order: true,
        width: '100px',
        render: (text, item) => {
            //console.log(item['name'])
            let path="/openstack/"+item['id']+'/'
          return ( 
              /*<a href="javascript:void(0);" onClick={this.handleClick.bind(this, item)}>{text}</a>*/
              <a href={path} >{text}</a>
            )
        },
        key: 'name'
      }, {
        title: '类型',
        key: 'flavor',
        order: true
      }, {
        title: '镜像名',
        key: 'image',
        order: true
      }, {
        title: 'IP地址',
        key: 'ip',
        width: '15%'
      }, {
        title: '状态',
        key: 'status',
        order:true,
        render: (text,item)=>{
          console.log('text_text',text)
         // console.log(item)
         if (text=="active" || text == "error" || text=="stopped"){return (<span>{text}</span>)}else{
          return (<div><Progress_model/></div>)}
        }
      }, {
        title: '创建时间',
        key: 'created',
        order: true
      }, /*{
        title: '操作',        
        render:(item, component)=> {
          return (
         <DropdownButton overlay={menu} type="primary">
            启动
          </DropdownButton>
          )
        },
        key: 'operation'
      }*/
      ]
    }
  },
  handleClick(item, event) {
    event = event ? event : window.event;
    event.stopPropagation();
    console.log(item.key)
    this.refs.modal.open()
  }, 
  onPageChange(page) {
     //TODO
     console.log('aaaaa')
  },
  handleCheckboxSelect(selectedRows) {
    console.log('rows:', selectedRows)
    console.log(this.refs['model_model'])
    console.log(selectedRows.length)
    if (selectedRows.length == 1 ){
      this.refs['model_model'].setState({
       button_status: false
    })}else{
        this.refs['model_model'].setState({
       button_status: true
    })}
    if (selectedRows.length > 0){
      this.refs['model_model'].setState({
       button_statuss: false
      })
    }
   // console.log(this.refs['delete'])
    //console.log(selectedRows.['name'])
    let arr=[]
    let arr_id=[]
    for (var i=0; i<selectedRows.length;i++){
    	//console.log(selectedRows[i]['name'])
    	arr.push(selectedRows[i]['name'])
    }
    for (var i=0; i<selectedRows.length;i++){
      //console.log(selectedRows[i]['name'])
      arr_id.push(selectedRows[i]['id'])
    }
    let b=' '
    let button_s=(selectedRows.length == 0) ? 'disabled': false
   // console.log(button_s)
    this.setState({
  			host_list:arr,
        host_list_id:arr_id,
        button_status: button_s,
        select_all:selectedRows
  	})
   // console.log(arr)
  },
  handleRowClick(row) {
    console.log('rowclick', row)
    console.log(row['age'])

  },
  handleOrder(name, sort) {
    console.log(name, sort)
  },
  handleOpen(name) {
    console.log(this.state.host_list)
    switch(name)
    {
    	case 1:
    	//	console.log('up')
     // console.log('Table-----',this.refs['Table'])
      let _this=this
      this.setState({
        loading:true
      })
      // console.log(this.state.select_all)
       let host_stop={}
       for (i in this.state.select_all){
             host_stop[this.state.select_all[i]['id']]=this.state.select_all[i]['name']
       }
       if (Object.keys(host_stop).length > 0){
      //  host_stop['method'] = "start"
          xhr({
           type: 'POST',
            url: 'bfddashboard/instances/',
            data: {
              method:"start",
              data:host_stop
            },
          success(data) {
           //console.log(data)
            //console.log(name)
            let start=''
            let error=''
            let stop=''
           // message.success('启动成功')
            for (i in data){
              console.log(i)
              console.log(data[i])
              if (data[i]=='active'){
                stop=stop+i+'、'
              }
              if (!data[i]){
                error=error+i+'、'
              }
              if (data[i]==true){
                start=start+i+'、'
              }
            }
            if (start.length>0){message.success(start+'启动成功')}
            if (error.length>0){message.success(error+'启动失败')}
            if (stop.length>0){message.success(stop+'已经启动')}

            _this.setState({
                loading:false,
                url: "bfddashboard/instances/?"+Math.random()
            })
          } 
        })
       }
    		//message.danger('这是失败信息')
    		break;
    	case 2:
        this.refs.modal.open()
    		if (this.state.host_list.length == 0){
    			let text="请选择需要重启主机"
    			this.setState({
  					text_text:text,
  					host_status:"重启",


  	  			})
    		}else{
    			let text='您已选择'
    			for (var i=0; i<this.state.host_list.length;i++){
    				text=text+'"'+this.state.host_list[i]+'"'+','
    			}
    			text=text+"请确认您的选择。云主机将会被重启"
    			this.setState({
  					text_text:text,
  					host_status:"重启",
            host_post:'restart'
  	  			})
    		}
    		break;
    	case 3:
        this.refs.modal.open()
    		if (this.state.host_list.length == 0){
    			let text="请选择需要关闭的主机"
    			this.setState({
  					text_text:text,
  					host_status:"停止"
  	  			})
    		}else{
    			let text='您已选择'
    			for (var i=0; i<this.state.host_list.length;i++){
    				text=text+'"'+this.state.host_list[i]+'"'+','
    			}
    			text=text+"请确认您的选择。云主机将会被关闭"
    			this.setState({
  					text_text:text,
  					host_status:"停止",
            host_post:'stop'
  	  			})
    		}
    		break;
    	case 4:
      this.refs.modal.open()
    	if (this.state.host_list.length == 0){
    			let text="请选择需要删除的主机"
    			this.setState({
  					text_text:text,
  				  host_status:"删除"
  	  			})
    		}else{
    			let text='您已选择'
    			for (var i=0; i<this.state.host_list.length;i++){
    				text=text+'"'+this.state.host_list[i]+'"'+','
    			}
    			text=text+"请确认您的选择。云主机将会被删除"
    			this.setState({
  					text_text:text,
  					host_status:"删除",
            host_post:'delete'
  	  			})
    		}
    		break;
        case 5:
          this.setState({
                url: "bfddashboard/instances/?"+Math.random()
            })
    }

  },
   handleclean(name) {
    //this.refs.modal.open()
    //console.log(this.refs.modal.getDOMNode())
    // console.log(this.refs.modal.reset()
    if (name=="clean"){this.refs.modal.close()}else{
      console.log(name)
    //  let select_all=
      this.refs.modal.close()
      OPEN.posthoststop(this,'bfddashboard/instances/',this.state.select_all,this.state.host_post)
    //  message.success('启动成功')

    }
  },
   handleOpen_re() {
    this.refs.modal.open()
    this.setState({test: "重启"});
    //console.log(this.refs.modal.getDOMNode())
    // console.log(this.refs.modal.reset()

  },
  disk_model_open(){
      this.refs.model_disk.open()
    },

  render() {
    const DropdownButton = Dropdown1.Button;
    const menu = (
          <Menu onClick={this.disk_model_open} >
            <Menu.Item disabled={this.state.button_status} key="1">创建备份</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="2">加载硬盘</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="3">更改配置</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="4">重置系统</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="5">强制重启</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="6">强制关机</Menu.Item>
          </Menu>
         );
    //let delete_1=this.state.button_status

    return (
      <div className="function-data-moduleA">
      <Spin spinning={this.state.loading}>
      	<div>
      		{/*<a href="/openstack/create" style={{margin: "0px 10px 0px 0px"}}><Button >创建</Button></a>
          <Button onClick={this.handleOpen.bind(this,1)}>创建</Button>*/}
          <Button onClick={this.handleOpen.bind(this,5)} style={{float:"left",margin:'0px 10px 0px 0px'}}>刷新</Button>
          <Create_model _this={this}/>
      		<Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this,1)} style={{float:"left"}}>启动</Button>
      		<Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this,2)} style={{float:"left"}}>重启</Button>
      		<Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this,3)} style={{float:"left"}}>停止</Button>
      		<Button disabled={this.state.button_status} type="danger"  onClick={this.handleOpen.bind(this,4)} style={{float:"left"}} >删除</Button>
          {/*<DropdownButton overlay={menu} type="primary" style={{margin: '0px 0px 0px 10px'}} className="operation_host">
            更多操作
          </DropdownButton>*/}
          <Disk_model vm_list={this.state.select_all} ref="model_model"/>
          <div style={{float: 'right'}}>
            <Extend/>
          </div>
          <Modal ref="modal">
          		<ModalHeader>
            		<h4>{this.state.test}</h4>
          		</ModalHeader>
          		<ModalBody>
          			<div>
           			 	<h4>{this.state.text_text}</h4>
           			 </div>
           			 <div className="create_host">
           			 	<Button onClick={this.handleclean.bind(this,'clean')}>关闭</Button>
      					  <Button onClick={this.handleclean.bind(this,this.state.host_post)}>{this.state.host_status}</Button>
           			 </div>
          		</ModalBody>
        	</Modal>
          <Modal ref="model_disk">
              <ModalHeader>
                <h4>{this.state.test}</h4>
              </ModalHeader>
              <ModalBody>
                <div>
                  <h4>{this.state.text_text}</h4>
                 </div>
                 <div className="create_host">
                  <Button onClick={this.handleclean.bind(this,'clean')}>关闭</Button>
                  <Button onClick={this.handleclean.bind(this,this.state.host_post)}>{this.state.host_status}</Button>
                 </div>
              </ModalBody>
          </Modal>
        	{/*<Modal ref="modal">
        	<Model_host
        		test={this.state.test}
        	/>
        	</Modal>*/}
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
		        onCheckboxSelect={this.handleCheckboxSelect}  ref="Table">
		      </DataTable>
		      </div>
          </Spin>
      </div>
    )
  }
})