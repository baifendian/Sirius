import SearchInput from 'bfd-ui/lib/SearchInput'
import React from 'react'
import './index.less'
import './extend.less'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import Button from 'bfd-ui/lib/Button'
import { MultipleSelect, Option } from 'bfd-ui/lib/MultipleSelect'
import { Row, Col } from 'bfd-ui/lib/Layout'
import xhr from 'bfd-ui/lib/xhr'
import { Spin } from 'antd'
import { notification } from 'antd'
import Input from 'bfd-ui/lib/Input'


import { Form, FormItem } from 'bfd-ui/lib/Form'
import FormInput from 'bfd-ui/lib/FormInput'
import FormTextarea from 'bfd-ui/lib/FormTextarea'
import { FormSelect, Option as Options } from 'bfd-ui/lib/FormSelect'
import message from 'bfd-ui/lib/message'
import OPEN from '../data_request/request.js'

const Disk_list = React.createClass({
  getInitialState() {
    return {
      percent: 0,
      status:'',
      title:'',
      button_status: true,
      host_name:'',
      select_disk:'',
      host_id:'',
      loading: false
      }
    },
    handleChange(values) {
      //console.log(values)
      this.setState({select_disk:values})

    },
    componentWillMount: function(){
      let host_name=this.props.vm_list[0]['name']
      let host_id=this.props.vm_list[0]['id']
      this.setState({host_name,host_id})
     },
  handlerequest(){
    const self=this
    this.setState({loading:true})
      xhr({
        type: 'POST',
        url: 'openstack/volumes/',
        data:{
          method: 'attach',
          disk: this.state.select_disk,
          host: this.state.host_id
        },
        success(data) {
          console.log(data)
          self.props._this.refs.model_disk.close()
          self.setState({loading:false})
          for (var i in data['totalList']){
            notification['info']({ message: '添加成功',description: '磁盘'+data['totalList'][i]['volumename']+'已连接到了虚拟机'+data['totalList'][i]['servername']+',磁盘盘符是'+data['totalList'][i]['device'],});
          }
         },
        error() {
          console.log('error')
          self.props._this.refs.model_disk.close()
           self.setState({loading:false})
          notification['error']({ message: '异常',description: '请检查虚拟机跟磁盘',});
        } 
      })},

  handleclose(){
    this.props._this.refs.model_disk.close()},
  render(){
    let _this=this
    let disk_display=this.props.disk_list.map((item,i)=>{
      return (
         <Option value={_this.props.disk_object[item]} key={i} >{item}</Option>
        )
    })
    return (
      <Spin size="large" spinning={this.state.loading}> 
        <div>
            <div>
             { /*<h3>选择加载到{this.state.host_name}虚拟机上的硬盘</h3>*/}
            </div>
        <div style={{"margin-top": "10px"}}>
          <Row>
            <Col col="md-6"  style={{"text-align":"right", "padding-right":"20px"}}><h3>虚拟机:</h3></Col>
            <Col col="md-6" ><h3>{this.state.host_name}</h3></Col>
          </Row>
        </div>
        <div style={{"margin-top": "10px"}}> 
          <span><h3 className="select_disk">选择磁盘:</h3></span>
          <MultipleSelect onChange={this.handleChange} style={{'margin-left': '22px'}}>
            {disk_display}
          </MultipleSelect>
          </div>
          <div className="create_host">
                  <Button onClick={this.handleclose}>取消</Button>
                  <Button onClick={this.handlerequest}>加载</Button>
          </div>
        </div>
        </Spin> 
      )
  }
})

const Vm_Type=React.createClass({
  getInitialState() {
    return {
      formData: {
        brand: 100,
        method: 'update',
        host_id: this.props.vm_list[0]['id'],
        host_name: this.props.vm_list[0]['name'],
        loading: false,
        type_vm:'flavor'
      },
      type:''
    }
  },
  componentWillMount: function(){
      let type=this.props.vm_list[0]['flavor']
      let host_id=this.props.vm_list[0]['name']
      this.setState({type})
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({ formData })
  },

  handleSave() {
    console.log('this.state.formData',this.state.formData)
    this.props._this.refs.model_disk.close()
    this.props.self.setState({loading:true})
    this.refs.form.save()
  },

  handleSuccess(res) {
    console.log('res.........',res)
    this.props.self.setState({loading:false})
    for (var i in res){
      if (res[i] == true){
        OPEN.update_url(this.props.self,"instances")
        message.success('修改成功！')
      }else{
        message.success('修改失败！')
      }
    }   
  },

  render() {
    const { formData } = this.state
    let _this=this
    let type_display=this.props.flavor_list.map((item,i)=>{
      return(<Options value={_this.props.flavor_object[item]} key={i}>{item}</Options>)
    })
    return (
      <Form 
        ref="form" 
        action="openstack/bfddashboard/instances/" 
        data={formData} 
        rules={this.rules} 
        onSuccess={this.handleSuccess}
      >
        <FormItem label="当前配置" required name="name" >
          <FormInput style={{width: '200px'}} placeholder={this.state.type} disabled></FormInput>
        </FormItem>
        
        <FormItem label="选择新配置" name="type">
          <FormSelect style={{width: '200px'}}>
            <Options value={100}>请选择</Options>
            {type_display}
          </FormSelect>
        </FormItem>
       
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>确定</button>
      </Form>
    )
  }
})

const Vm_image=React.createClass({
  getInitialState() {
    return {
      formData: {
        brand: 100,
        method: 'update',
        host_id: this.props.vm_list[0]['id'],
        host_name: this.props.vm_list[0]['name'],
        loading: false,
        type_vm:'image'
      },
      type:''
    }
  },
  componentWillMount: function(){
      let type=this.props.vm_list[0]['flavor']
      let host_id=this.props.vm_list[0]['name']
      this.setState({type})
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({ formData })
  },

  handleSave() {
    console.log('this.state.formData',this.state.formData)
    this.props._this.refs.model_disk.close()
    this.props.self.setState({loading:true})
    this.refs.form.save()
  },

  handleSuccess(res) {
    console.log('res.........',res)
    this.props.self.setState({loading:false})
    for (var i in res){
      if (res[i] == true){
        OPEN.update_url(this.props.self,"instances")
        message.success('修改成功！')
      }else{
        message.success('修改失败！')
      }
    }   
  },

  render() {
    const { formData } = this.state
    let _this=this
    let type_display=this.props.data_list.map((item,i)=>{
      return(<Options value={this.props.data_object[item]} key={i}>{item}</Options>)
    })
    return (
      <Form 
        ref="form" 
        action="openstack/bfddashboard/instances/" 
        data={formData} 
        rules={this.rules} 
        onSuccess={this.handleSuccess}
      > 
        <FormItem label="选择镜像" name="type">
          <FormSelect style={{width: '200px'}}>
           <Options value={100}>请选择</Options>
            {type_display}
          </FormSelect>
        </FormItem> 
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>确定</button>
      </Form>
    )
  }
})


const Forced_vm=React.createClass({

    getInitialState() {
    return {
      formData: {
        brand: 0,
        method: 'restart',
        type:'restart'
      },
      host_id:[],
      host_name:''

    }
  },
  componentWillMount: function(){
    let host_id=[]
    let host_name=''
    for (var i in this.props.vm_list){
      console.log(i)
      host_id.push(this.props.vm_list[i]['id'])
      host_name=host_name+this.props.vm_list[i]['name']+'、'
    }
    this.setState({host_id,host_name})
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({ formData })
  },

  handleSave() {
    console.log(this.state.formData)
    this.refs.form.save()
  },

  handleSuccess(res) {
    console.log(res)
    message.success('保存成功！')
  },

  render() {
    const { formData } = this.state
    return (
      <Form 
        ref="form" 
        action="openstack/bfddashboard/instances/" 
        data={formData} 
        rules={this.rules} 
        onSuccess={this.handleSuccess}
      >
       <div><h5>确定{this.props.title}{this.state.host_name}虚拟机？</h5></div>
        <div><Icon type="fa-exclamation-circle" /><h5><Icon type="weixin" />{this.props.title}将直接断开虚拟机电源重新启动，虚拟机可能丢失数据，请确认数据已保存。</h5></div>
        {/*<button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>保存</button>*/}
       <div className="create_host">
          <Button >取消</Button>
          <Button onClick={this.handleSave}>确定</Button>
        </div>
      </Form>

    )
  }
})

const Disk_model=React.createClass({
	getInitialState() {
    return {
      percent: 0,
      status:'',
      title:'',
      model:[1],
      button_status: true,
      button_statuss:true,
      disk_list:[0],
      disk_object:{},
      flavor_list:[0],
      flavor_object:{},
      data_list:[0],
      data_object:{},
      loading: false
      }
  	},
     componentWillMount: function(){
      console.log(this.props.vm_list)
     },

	handleOpen(event) {
    	this.refs.model_disk.open()  
     const _this=this
      if ( event['key'] == 2 ){
            this.setState({loading:true})
            xhr({
              type: 'GET',
              url: 'openstack/volumes/',
              success(data) {
                let disk_list=[]
                let disk_object={}
                for (var i in data['totalList']){
                  if (!data['totalList'][i]['device']){
                    disk_list.push(data['totalList'][i]['name'])
                    disk_object[data['totalList'][i]['name']]=data['totalList'][i]['id']
                  }}
                _this.setState({ disk_list,loading:false,disk_object })
                }     
              })
          console.log('this.state.disk_list',this.state.disk_list)
          this.setState({
            title:'磁盘添加',model:[2]
          })
      }
      if (event['key'] == 3){
          this.setState({loading:true})
            xhr({
              type: 'GET',
              url: 'openstack/flavors/',
              success(data) {
                console.log(data)
                let flavor_list=[]
                let flavor_object={}
                for (var i in data['name']){
                  flavor_list.push(data['name'][i])
                  flavor_object[data['name'][i]]=i
                } 
                _this.setState({flavor_object,flavor_list,loading:false})
              }
              })
        this.setState({
            title:'修改类型',
            model:[3]
          })
      }
      if (event['key'] == 4){
        this.setState({loading:true})
        OPEN.Get_image(this,this.handlerequest)
        this.setState({
         title:'重置虚拟机',
          model:[4]
        })
      }
      if (event['key'] == 5){
        this.setState({
         title:'强制重启',
          model:[5]
        })
      }
  	},
  handlerequest(_this,return_data){
    let data_list=[]
    let data_object={}
    for (var i in return_data['name']){
      data_list.push(return_data['name'][i])
      data_object[return_data['name'][i]]=i
    } 
    _this.setState({data_list,data_object,loading:false})
  },

  handleclose(){
    this.refs.model_disk.close()},
  render() {
  	const DropdownButton = Dropdown1.Button;
    const menu = (
          <Menu onClick={this.handleOpen}>
            <Menu.Item disabled={this.state.button_status} key="1">创建备份</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="2">加载硬盘</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="3">更改配置</Menu.Item>
            <Menu.Item disabled={this.state.button_status} key="4">重置系统</Menu.Item>
            <Menu.Item disabled={this.state.button_statuss} key="5">强制重启</Menu.Item>
          </Menu>
         );
 
    return (       
    	<div style={{float:"left"}}>  	
     	<DropdownButton overlay={menu} type="primary" trigger={['click']} style={{margin: '0px 0px 0px 10px'}} className="operation_host">
         	更多操作
        </DropdownButton>
          <Modal ref="model_disk">
            <Spin size="large" spinning={this.state.loading}> 
              <ModalHeader>
                <h4>{this.state.title}</h4>
              </ModalHeader>
              <ModalBody>
                <div>
                  { this.state.model.map((item,i)=>{
                    if (item == 2){
                    return (<Disk_list key={i} vm_list={this.props.vm_list} disk_list={this.state.disk_list} disk_object={this.state.disk_object} _this={this}/>)
                  }
                  if (item == 3){
                    return (<Vm_Type key={i} vm_list={this.props.vm_list} flavor_list={this.state.flavor_list} flavor_object={this.state.flavor_object} _this={this} self={this.props._this}/>)
                  }
                  if (item == 4) {
                    return (<Vm_image key={i} vm_list={this.props.vm_list} data_list={this.state.data_list} data_object={this.state.data_object} _this={this} self={this.props._this}/>)
                  }
                  if (item == 5){
                    return (<Forced_vm key={i} vm_list={this.props.vm_list} title={this.state.title}/>)
                  }
                })}
                 </div>
              </ModalBody>
              </Spin> 
              
          </Modal>
        </div>
    )
  }
})

export {Disk_model}