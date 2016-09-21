import React from 'react'
//import Task from 'public/Task'
import { Menu, Dropdown as Dropdown1 ,Icon as Iconant  } from 'antd'
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
import { Icon } from 'antd'
import './jquery.min.js'
import NavigationInPage from 'public/NavigationInPage'


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
      select_host:'',
      button_status:"disabled",
    	url: "openstack/bfddashboard/instances/",
      column: [{
        title:'序号',
        key:'sequence'
      }, {
        title: '名称',
        order: true,
        width: '100px',
        render: (text, item) => {
            let path="/openstack/"+item['id']+'/'
          return ( 
              <div>
                <a href={path} >{text}</a><a href="javascript:void(0);" style={{"margin-left":"20px"}} onClick={this.requestvnc.bind(this,1,item['id'])}><Icon type="desktop" /></a>
              </div>
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
         if (text=="active" || text == "error" || text=="stopped"){return (<span>{text}</span>)}else{
          return (<div><Progress_model/></div>)}
        }
      }, {
        title: '创建时间',
        key: 'created',
        order: true
      }
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
     console.log('aaaaa')
  },
  requestvnc(id,return_data,e){
    //window.location.href=return_data
    this.setState({loading:true})
    if (id == '1'){OPEN.open_vnc(this,return_data,this.requestvnc)}else{
      if($('#aObj-span').length != 0){
        $('#aObj-span').parent().attr('href',return_data['console']['url']);
        $('#aObj-span').trigger('click');
        id.setState({loading:false})
      }else{
        let aObj = $('<a href="'+return_data['console']['url']+'" target="_blank"><span id="aObj-span"></span></a>');
        $('body').append(aObj);
        $('#aObj-span').trigger('click');
        id.setState({loading:false})
      }
    }
    //console.log('return_data',return_data)
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
    let arr=[]
    let arr_id=[]
    for (var i=0; i<selectedRows.length;i++){
    	arr.push(selectedRows[i]['name'])
    }
    for (var i=0; i<selectedRows.length;i++){
      arr_id.push(selectedRows[i]['id'])
    }
    let b=' '
    let button_s=(selectedRows.length == 0) ? 'disabled': false
    this.setState({
  			host_list:arr,
        host_list_id:arr_id,
        button_status: button_s,
        select_all:selectedRows
  	})
  },
  handleRowClick(row) {
    console.log('rowclick', row)
    //OPEN.open_vnc(this,row,this.requestvnc)
  },
  handleOrder(name, sort) {
    console.log(name, sort)
  },
  handleOpen(name) {
    let text='您已选择'
    switch(name)
    {
    	case 1:
        OPEN.posthoststop(this,'openstack/bfddashboard/instances/',this.state.select_all,"start")
    		break;
    	case 2:
        this.refs.modal.open()
    		for (var i=0; i<this.state.host_list.length;i++){
    			text=text+'"'+this.state.host_list[i]+'"'+','
    		}
    		text=text+"请确认您的选择。云主机将会被重启"
    		this.setState({
  				text_text:text,
  				host_status:"重启",
          host_post:'restart'
  	  	})
    		break;
    	case 3:
        this.refs.modal.open()
    		for (var i=0; i<this.state.host_list.length;i++){
    			text=text+'"'+this.state.host_list[i]+'"'+','
    		}
    		text=text+"请确认您的选择。云主机将会被关闭"
    		this.setState({
  				text_text:text,
  				host_status:"停止",
          host_post:'stop'
  	  	})    		
    		break;
    	case 4:
        this.refs.modal.open()
    		for (var i=0; i<this.state.host_list.length;i++){
    			text=text+'"'+this.state.host_list[i]+'"'+','
    		}
    		text=text+"请确认您的选择。云主机将会被删除"
    		this.setState({
  				text_text:text,
  				host_status:"删除",
          host_post:'delete'
  	  	})
    	 break;
      case 5:
        this.setState({
          url: ("openstack/bfddashboard/instances/?"+Math.random()),
          button_status: true
        })
    }

  },
   handleclean(name) {
    if (name=="clean"){this.refs.modal.close()}else{
      this.refs.modal.close()
      OPEN.posthoststop(this,'openstack/bfddashboard/instances/',this.state.select_all,this.state.host_post)
    }
  },
   handleOpen_re() {
    this.refs.modal.open()
    this.setState({test: "重启"})
  },
  disk_model_open(){
      this.refs.model_disk.open()
    },

  render() {
    let naviTexts = [{  'url':'/','text':'概览'   },
      {'url':'','text':'云主机'   },
      {'url':'','text':'计算'   },
      {'url':'/openstack/instances','text':'虚拟机'   }]
    return (
      <div className="function-data-moduleA">
      <NavigationInPage naviTexts={naviTexts} headText="openstack" />
      <Spin spinning={this.state.loading}>
      	<div>
          <Button onClick={this.handleOpen.bind(this,5)} style={{float:"left",margin:'0px 10px 0px 0px'}}>刷新</Button>
          <Create_model _this={this}/>
      		<Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this,1)} style={{float:"left"}}>启动</Button>
      		<Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this,2)} style={{float:"left"}}>重启</Button>
      		<Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this,3)} style={{float:"left"}}>停止</Button>
      		<Button disabled={this.state.button_status} type="danger"  onClick={this.handleOpen.bind(this,4)} style={{float:"left"}} >删除</Button>
          <Disk_model vm_list={this.state.select_all} ref="model_model" _this={this}/>
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
                         <Button onClick={this.handleclean.bind(this,this.state.host_post)}>{this.state.host_status}</Button>
                         <Button onClick={this.handleclean.bind(this,'clean')}>取消</Button>
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
                  <Button onClick={this.handleclean.bind(this,this.state.host_post)}>{this.state.host_status}</Button>
                  <Button onClick={this.handleclean.bind(this,'clean')}>取消</Button>
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
		        onCheckboxSelect={this.handleCheckboxSelect}  ref="Table">
		      </DataTable>
		      </div>
          </Spin>
      </div>
    )
  }
})