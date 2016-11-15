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
import DataTable from 'bfd-ui/lib/DataTable'

const Disk_list = React.createClass({
  getInitialState() {
    return {
      host_name: '',
      data:[],
      select_disk: '',
      host_id: '',
      disk_list: [],
      disk_object: {},
      loading: false,
      column: [{ title: '云硬盘名', order: false, key: 'disk_name'},
              {  title: '盘符',   order: false , key: 'device',},
              {  title: '大小',   order: false , key: 'size',},
              {  title: '操作',   order: false , key: 'operation',
              render: (text, item)=> {
                  return <a href = "javascript:void(0);" onClick = {this.handleClick.bind(this, text)}>卸载云硬盘</a>
              }
            }],
     }
  },
  handleChange(values) {
    this.setState({select_disk: values})
  },

  componentWillMount: function () {
    let host_name = this.props.vm_list[0]['name']
    let host_id = this.props.vm_list[0]['id']
    //let data=this.props.vm_list[0]['disk_list']
    this.setState({host_name, host_id})
    this.Disk_list()

    let _this=this
    let url_v=OPEN.UrlList()['volumes']
    xhr({
      type: 'GET',
      url: url_v,
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
  },

  Disk_list(){
    this.setState({loading:true})
    OPEN.Get_vmdisk(this,this.props.vm_list[0]['id'],this.xhrCallback_test)
  } ,

  xhrCallback_test: (_this, executedData) => {
    _this.setState({
      data: executedData['disk_list'],
      loading:false
    })
  },

  handleClick(item){
    this.setState({loading:true})
    const url=OPEN.UrlList()['instances_post']
    let post_data={'host_id':this.state.host_id,'disk_id':item['disk_id'],'host_name':this.state.host_name,'disk_name':item['disk_name']}
    console.log(post_data)
    OPEN.xhrPostData(this,url,post_data,'vm_uninstall',this.xhrCallback)
    console.log(this.state.data)
    const _this=this
  },

  xhrCallback: (_this, executedData) => {
    if (executedData['status']){
      message.success('卸载成功')
    }else{
      message.danger('卸载失败')
    }

    _this.setState({
      data: executedData['disk_list'],
    })
    xhr({
      type: 'GET',
      url: 'v1/openstack/volumes/',
      success(data) {
        let disk_list = []
        let disk_object = {}
        for (var i in data['totalList']) {
          if (!data['totalList'][i]['device']) {
            disk_list.push(data['totalList'][i]['name'])
            disk_object[data['totalList'][i]['name']] = data['totalList'][i]['id']
          }
        }
        _this.setState({disk_list, disk_object,loading:false})
      }
    })
  },

  handlerequest(){
    const self = this
    this.setState({loading: true})
    let url=OPEN.UrlList()['volumes']
    xhr({
      type: 'POST',
      url: url,
      data: {
        method: 'attach',
        disk: this.state.select_disk,
        host: this.state.host_id
      },
      success(data) {
        self.props._this.refs.model_disk.close()
        OPEN.update_url(self.props.self,"instances")
        self.setState({loading: false})
        //console.log(data)
        //self.Disk_list()
        for (var i in data['totalList']) {
          if (data['totalList'][i]['status']){
          /*  notification['info']({
              message: '添加成功',
              description: '磁盘' + data['totalList'][i]['volumename'] + '已连接到了虚拟机' + data['totalList'][i]['servername'] + ',磁盘盘符是' + data['totalList'][i]['device'],
            });*/
            message.success('加载成功')
          }else{
            message.danger('加载失败')
          }
        }
      },
      error() {
        self.props._this.refs.model_disk.close()
        self.setState({loading: false})
        notification['error']({message: '异常', description: '请检查虚拟机和云硬盘',});
      }
    })

  },

  handleclose(){
    this.props._this.refs.model_disk.close()
  },

  render(){
    let _this = this
    let disk_display = this.state.disk_list.map((item, i)=> {
      return (
        <Option value={_this.state.disk_object[item]} key={i}>{item}</Option>
      )
    })
    let data = {
      totalList: this.state.data,
      totalPageNum: 1
    }
    return (
      <Spin size="large" spinning={this.state.loading}>
        <div>
          <div>
              <div>注意：卸载云硬盘之前，请确保该云硬盘在主机的操作系统中处于未挂载状态 (unmounted)。</div>
              <DataTable
                data={data}
                showPage="false"
                column={this.state.column}
                howRow={10}
                onOrder={this.handleOrder}
                onCheckboxSelect={this.handleCheckboxSelect}>
              </DataTable>
          </div>
          <div style={{border: '1px solid #2196f3', margin: '0px 0px 28px 0px'}}></div>
          <div style={{"margin-top": "10px"}}>
            <Row>
              <span>加载云硬盘</span>
            </Row>
          </div>
          <div style={{"margin-top": "10px"}} >
            <span>选择云硬盘:</span>
            <MultipleSelect onChange={this.handleChange} style={{'margin-left': '22px'}} ref="select_t">
              {disk_display}
            </MultipleSelect>
          </div>
          <div  className="openstack_button_s" >
            <Button onClick={this.handlerequest} >确认</Button>
            <Button onClick={this.handleclose} style={{margin: "0px 0px 0px 100px"}}>取消</Button>
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
        type_vm: 'flavor',
        flavor_object:{},
        flavor_list:[]
      },
      type: ''
    }
  },
  componentWillMount: function () {
    let type = this.props.vm_list[0]['flavor']
    let host_id = this.props.vm_list[0]['name']
    this.setState({type})

    let url_f=OPEN.UrlList()['flavors']
    let _this=this
    xhr({
      type: 'GET',
      url: url_f,
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
    let type_display = this.state.flavor_list?this.state.flavor_list.map((item, i)=> {
      return (<Options value={_this.state.flavor_object[item]} key={i}>{item}</Options>)
    }):null
    return (
      <Form
        ref="form"
        action="v1/openstack/bfddashboard/instances/"
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
    this.props._this.refs.model_disk.close()
    this.props.self.setState({loading: true})
    this.refs.form.save()
  },


  handleclose(){
    this.props._this.refs.model_disk.close()
  },

  handleSuccess(res) {
    this.props.self.setState({loading: false})
  //  this.props._this.refs.model_disk.close()
    if (res['status']){
      message.success('创建备份成功！')}else{
        if (res['return']){
        message.danger('创建备份失败!')}else{
        message.danger('备份名冲突!')
        }
    }
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
        message.success('重置成功！')
        this.props.self.setState({title_status:'正在重置'})
      } else {
        message.success('重置失败！')
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
        action="v1/openstack/bfddashboard/instances/"
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
      loading: false,
      data:[],
    }
  },
  values(){
    return {
      'Vm_Backup': "创建备份",
      'Disk_list': "管理云硬盘",
      'Vm_Type': "更改配置",
      'Vm_image': "重置系统",
    }
  },
  modulevalue(){
    return {
      'Vm_Backup': <Vm_Backup vm_list={this.props.vm_list} _this={this} self={this.props._this}/>,
      'Disk_list': <Disk_list vm_list={this.props.vm_list} disk_list={this.state.disk_list} disk_object={this.state.disk_object} _this={this} self={this.props._this} data={this.state.data}/>,
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

 /* componentWillMount: function() {
    const _this = this
    let url_v=OPEN.UrlList()['volumes']
    let url_f=OPEN.UrlList()['flavors']
    xhr({
      type: 'GET',
      url: url_v,
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
      url: url_f,
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
  },*/

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
        <Menu.Item key="3" disabled={this.props.button_status}>关机</Menu.Item>
        <Menu.Item key="Vm_Backup" disabled={this.props.button_statuss}>创建备份</Menu.Item>
        <Menu.Item key="Disk_list" disabled={this.props.button_statuss}>管理云硬盘</Menu.Item>
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