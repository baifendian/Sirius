import SearchInput from 'bfd-ui/lib/SearchInput'
import React from 'react'
import './index.less'
import './extend.less'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Menu, Dropdown as Dropdown1, Icon} from 'antd'
import Button from 'bfd-ui/lib/Button'
import {MultipleSelect, Option} from 'bfd-ui/lib/MultipleSelect'
import {Row, Col} from 'bfd-ui/lib/Layout'
import xhr from 'bfd/xhr'
import {Spin} from 'antd'
import {notification} from 'antd'
import Input from 'bfd-ui/lib/Input'
import { Form, FormItem, FormSubmit, FormInput, FormSelect, Option as Options, FormTextarea } from 'bfd/Form'
import update from 'react-update'
import message from 'bfd-ui/lib/message'
import OPEN from '../data_request/request.js'

const Disk_list = React.createClass({
  getInitialState() {
    return {
      percent: 0,
      status: '',
      title: '',
      button_status: true,
      host_name: '',
      select_disk: '',
      host_id: '',
      loading: false
    }
  },
  handleChange(values) {
    this.setState({select_disk: values})

  },
  componentWillMount: function () {
    let host_name = this.props.vm_list[0]['name']
    let host_id = this.props.vm_list[0]['id']
    this.setState({host_name, host_id})
    console.log(this.props.vm_list)
  },
  handlerequest(){
    const self = this
    this.setState({loading: true})
    xhr({
      type: 'POST',
      url: 'openstack/volumes/',
      data: {
        method: 'attach',
        disk: this.state.select_disk,
        host: this.state.host_id
      },
      success(data) {
        // console.log(data)
        self.props._this.refs.model_disk.close()
        self.setState({loading: false})
        for (var i in data['totalList']) {
          notification['info']({
            message: '添加成功',
            description: '磁盘' + data['totalList'][i]['volumename'] + '已连接到了虚拟机' + data['totalList'][i]['servername'] + ',磁盘盘符是' + data['totalList'][i]['device'],
          });
        }
      },
      error() {
        //console.log('error')
        self.props._this.refs.model_disk.close()
        self.setState({loading: false})
        notification['error']({message: '异常', description: '请检查虚拟机跟磁盘',});
      }
    })
  },

  handleclose(){
    this.props._this.refs.model_disk.close()
  },
  render(){
    let _this = this
    let disk_display = this.props.disk_list.map((item, i)=> {
      return (
        <Option value={_this.props.disk_object[item]} key={i}>{item}</Option>
      )
    })
    return (
      <Spin size="large" spinning={this.state.loading}>
        <div>
          <div style={{"margin-top": "10px"}}>
            <Row>
              <Col col="md-1">虚拟机:</Col>
              <Col col="md-11">{this.state.host_name}</Col>
            </Row>
          </div>
          <div style={{"margin-top": "10px"}}>
            <span>选择磁盘:</span>
            <MultipleSelect onChange={this.handleChange} style={{'margin-left': '22px'}}>
              {disk_display}
            </MultipleSelect>
          </div>
          <div style={{"margin-top": "10px"}}>
            <Button onClick={this.handlerequest}>确认</Button>
            <Button onClick={this.handleclose}>取消</Button>
          </div>
        </div>
      </Spin>
    )
  }
})

const Vm_Type = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    return {
      formData: {
        brand: 100,
        method: 'update',
        host_id: this.props.vm_list[0]['id'],
        host_name: this.props.vm_list[0]['name'],
        loading: false,
        type_vm: 'flavor'
      },
      type: ''
    }
  },
  componentWillMount: function () {
    let type = this.props.vm_list[0]['flavor']
    let host_id = this.props.vm_list[0]['name']
    this.setState({type})
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
    this.props._this.refs.model_disk.close()
    this.props.self.setState({loading: true})
    this.refs.form.save()
  },

  handleclose(){
    this.props._this.refs.model_disk.close()
  },

  handleSuccess(res) {
    this.props.self.setState({loading: false})
    for (var i in res) {
      if (res[i] == true) {
        OPEN.update_url(this.props.self, "instances")
        message.success('修改成功！')
      } else {
        message.success('修改失败！')
      }
    }
  },

  render() {
    const {formData} = this.state
    let _this = this
    let type_display = this.props.flavor_list.map((item, i)=> {
      return (<Options value={_this.props.flavor_object[item]} key={i}>{item}</Options>)
    })
    return (
      <Form
        ref="form"
        action="openstack/bfddashboard/instances/"
        data={formData}
        rules={this.rules}
        onChange={formData => this.update('set', { formData })}
        onSuccess={this.handleSuccess}
      >
        <FormItem label="当前配置" required name="name">
          <FormInput style={{width: '200px'}} placeholder={this.state.type} disabled></FormInput>
        </FormItem>

        <FormItem label="选择新配置" name="type">
          <FormSelect style={{width: '200px'}}>
            <Options value={100}>请选择</Options>
            {type_display}
          </FormSelect>
        </FormItem>
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>确定
        </button>
        <button type="button" style={{marginLeft: '150px'}} className="btn btn-primary" onClick={this.handleclose}>取消
        </button>
      </Form>
    )
  }
})


const Vm_Backup = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) return '名称不能为空'
      },
      date(v) {
        if (!v) return '日期不能为空'
      }
    }
    return {
      formData: {
        name: this.volumes_id()['name'],
        id: this.volumes_id()['id'],
        method: 'instances_backup'
      },
      volumes_id: this.volumes_id()
    }
  },
  volumes_id(){
    let volumes_id = {}
    let volumes_size = {}
    for (let i in this.props.vm_list) {
      volumes_id['name'] = this.props.vm_list[i]['name']
      volumes_id['id'] = this.props.vm_list[i]['id']
    }
    return volumes_id
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
    this.refs.form.save()
  },


  handleclose(){
    this.props._this.refs.model_disk.close()
  },

  handleSuccess(res) {
    this.props._this.refs.modal.close()
    message.success('保存成功！')
  },
  render() {
    const {formData} = this.state
    let url = OPEN.UrlList()['volumes_post']
    return (
      <div >
        <Form
          ref="form"
          action={url}
          data={formData}
          rules={this.rules}
          onChange={formData => this.update('set', { formData })}
          onSuccess={this.handleSuccess}
        >
          <FormItem label="备份名称" required name="name_bakup">
            <FormInput style={{width: '200px'}}></FormInput>
          </FormItem>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建
          </button>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleclose}>
            取消
          </button>

        </Form>
      </div>
    )
  }
})


const Vm_image = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    return {
      formData: {
        brand: 100,
        method: 'update',
        host_id: this.props.vm_list[0]['id'],
        host_name: this.props.vm_list[0]['name'],
        type: '',
        type_vm: 'image',
      },
      loading: false,
      data_list:[],
      data_object:{},
      loading: false
    }
  },
  componentWillMount: function () {
    this.setState({loading:true})
    let type = this.props.vm_list[0]['flavor']
    let host_id = this.props.vm_list[0]['name']
    this.setState({type})
    OPEN.Get_image(this, this.handlerequest)
  },

  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
    this.props._this.refs.model_disk.close()
    this.props.self.setState({loading: true})
    this.refs.form.save()
  },

  handleSuccess(res) {
    this.props.self.setState({loading: false})
    for (var i in res) {
      if (res[i] == true) {
        OPEN.update_url(this.props.self, "instances")
        message.success('修改成功！')
      } else {
        message.success('修改失败！')
      }
    }
  },

  handleclose(){
    this.props._this.refs.model_disk.close()
  },

  handlerequest(_this, return_data){
    let data_list = []
    let data_object = {}
    for (var i in return_data['name']) {
      data_list.push(return_data['name'][i])
      data_object[return_data['name'][i]] = i
    }
    _this.setState({data_list, data_object,loading:false})
  },


  render() {
    const {formData} = this.state
    let _this = this
    let type_display = this.state.data_list && this.state.data_list.map((item, i)=> {
      return (<Options value={this.state.data_object[item]} key={i}>{item}</Options>)
    })
    let url=OPEN.UrlList()['instances']
    return ( 
      <Spin size="large" spinning={this.state.loading}>
      <Form
        ref="form"
        action={url}
        data={formData}
        rules={this.rules}
        onChange={formData => this.update('set', { formData })}
        onSuccess={this.handleSuccess}
      >
        <FormItem label="选择镜像" name="type">
          <FormSelect style={{width: '200px'}}>
            <Options value={100}>请选择</Options>
            {type_display}
          </FormSelect>
        </FormItem>
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>确定
        </button>
        <button type="button" style={{marginLeft: '150px'}} className="btn btn-primary" onClick={this.handleclose}>取消
        </button>
        </Form>
      </Spin>
    )
  }
})


const Forced_vm = React.createClass({

  getInitialState() {
    this.update = update.bind(this)
    return {
      formData: {
        brand: 0,
        method: 'restart',
        type: 'restart'
      },
      host_id: [],
      host_name: ''

    }
  },
  componentWillMount: function () {
    let host_id = []
    let host_name = ''
    for (var i in this.props.vm_list) {
      host_id.push(this.props.vm_list[i]['id'])
      host_name = host_name + this.props.vm_list[i]['name'] + '、'
    }
    this.setState({host_id, host_name})
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
    this.refs.form.save()
  },

  handleSuccess(res) {
    message.success('保存成功！')
  },

  render() {
    const {formData} = this.state
    return (
      <Form
        ref="form"
        action="openstack/bfddashboard/instances/"
        data={formData}
        rules={this.rules}
        onChange={formData => this.update('set', { formData })}
        onSuccess={this.handleSuccess}
      >
        <div>确定{this.props.title}{this.state.host_name}虚拟机？</div>
        <div><Icon type="fa-exclamation-circle"/><Icon type="weixin"/>{this.props.title}将直接断开虚拟机电源重新启动，虚拟机可能丢失数据，请确认数据已保存。
        </div>
        <div className="create_host">
          <Button onClick={this.handleSave}>确定</Button>
          <Button onClick={this.handleclose}>取消</Button>
        </div>
      </Form>

    )
  }
})

const Disk_model = React.createClass({
  getInitialState() {
    return {
      percent: 0,
      status: '',
      title: '',
      model: [1],
      button_status: true,
      button_statuss: true,
      disk_list: [0],
      disk_object: {},
      flavor_list: [0],
      flavor_object: {},
      data_list: [0],
      data_object: {},
      loading: false
    }
  },
  values(){
    return {
      'Vm_Backup': "创建备份",
      'Disk_list': "加载云硬盘",
      'Vm_Type': "更改配置",
      'Vm_image': "重置系统",
    }
  },
  modulevalue(){
    return {
      'Vm_Backup': <Vm_Backup vm_list={this.props.vm_list} _this={this}/>,
      'Disk_list': <Disk_list vm_list={this.props.vm_list} disk_list={this.state.disk_list} disk_object={this.state.disk_object} _this={this}/>,
      'Vm_Type': <Vm_Type vm_list={this.props.vm_list} flavor_list={this.state.flavor_list} flavor_object={this.state.flavor_object} _this={this} self={this.props._this}/>,
      'Vm_image': <Vm_image vm_list={this.props.vm_list} data_list={this.state.data_list} data_object={this.state.data_object} _this={this} self={this.props._this}/>,
    }
  },
  handleButtonClick(e) {
    //console.log('click left button', e)
  },

  handlerequest(_this, return_data){
    let data_list = []
    let data_object = {}
    for (var i in return_data['name']) {
      data_list.push(return_data['name'][i])
      data_object[return_data['name'][i]] = i
    }
    _this.setState({data_list, data_object, loading: false})
  },

  componentWillMount: function() {
    const _this = this
    xhr({
      type: 'GET',
      url: 'openstack/volumes/',
      success(data) {
        let disk_list = []
        let disk_object = {}
        for (var i in data['totalList']) {
          if (!data['totalList'][i]['device']) {
            disk_list.push(data['totalList'][i]['name'])
            disk_object[data['totalList'][i]['name']] = data['totalList'][i]['id']
          }
        }
        _this.setState({disk_list, disk_object})
      }
    })
    xhr({
      type: 'GET',
      url: 'openstack/flavors/',
      success(data) {
        let flavor_list = []
        let flavor_object = {}
        for (var i in data['name']) {
          flavor_list.push(data['name'][i])
          flavor_object[data['name'][i]] = i
        }
        _this.setState({flavor_object, flavor_list})
      }
    })
  },
  handleMenuClick(e) {
    if (parseInt(e['key'])*1){
      this.props._this.callback_status(parseInt(e['key']))
    }else{
    this.setState({loading: true})
//    OPEN.Get_image(this, this.handlerequest)
    const _this = this
    this.setState({loading:false})
    let module = this.modulevalue()[e["key"]]
    this.setState({title: this.values()[e['key']], module})
    this.refs.model_disk.open()
  }
  },
  render() {
    const DropdownButton = Dropdown1.Button;
    const menu = (
      <Menu onClick={this.handleMenuClick} style={{"text-align":"center"}}>
        <Menu.Item key="1" disabled={this.props.button_status} >启动</Menu.Item>
        <Menu.Item key="2" disabled={this.props.button_status}>重启</Menu.Item>
        <Menu.Item key="3" disabled={this.props.button_status}>关闭</Menu.Item>
        <Menu.Item key="Vm_Backup" disabled={this.props.button_statuss}>创建备份</Menu.Item>
        <Menu.Item key="Disk_list" disabled={this.props.button_statuss}>加载云硬盘</Menu.Item>
        <Menu.Item key="Vm_Type" disabled={this.props.button_statuss}>更改配置</Menu.Item>
        <Menu.Item key="Vm_image" disabled={this.props.button_statuss}>重置系统</Menu.Item>
        <Menu.Item key="4" disabled={this.props.button_status}>删除</Menu.Item>
      </Menu>
    )
    return (
      <div>
        <DropdownButton onClick={this.handleButtonClick} overlay={menu} type="primary" trigger={['click']} className="antd_class">
          更多操作
        </DropdownButton>
        <div>
          <Modal ref="model_disk">
           <Spin size="large" spinning={this.state.loading}>
            <ModalHeader>
              <h4>{this.state.title}</h4>
            </ModalHeader>
            <ModalBody>
              {this.state.module}
            </ModalBody>
            </Spin>
          </Modal>
        </div>
      </div>
    )
  }
})

export {Disk_model}