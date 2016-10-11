import message from 'bfd-ui/lib/message'
import React from 'react'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Select, Option as Optionb} from 'bfd/Select'
import Button from 'bfd-ui/lib/Button'
import OPEN from '../data_request/request.js'
import DataTable from 'bfd/DataTable'
import { Form, FormItem, FormSubmit, FormInput, FormSelect, Option, FormTextarea } from 'bfd/Form'
import update from 'react-update'
import {Menu, Dropdown} from 'antd';


const Redact = React.createClass({
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
        id: this.volumes_id()['id'],
        method: 'Redact',
        name: this.volumes_id()['name'],
        desc: this.volumes_id()['desc']
      },
      volumes_id: this.volumes_id()
    }
  },
  volumes_id(){
    let volumes_id = {}
    let volumes_size = {}
    for (let i in this.props.volumes_all) {
      volumes_id['desc'] = this.props.volumes_all[i]['displayDescription']
      volumes_id['name'] = this.props.volumes_all[i]['name']
      volumes_id['id'] = this.props.volumes_all[i]['id']
    }
    return volumes_id
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
    this.props._this.refs.modal.close()
    this.props._self.setState({loading:true})
    this.refs.form.save()
  },

  handleclose() {
    this.props._this.refs.modal.close()
  },

  handleSuccess(res) {
    this.props._self.setState({loading:false})
    OPEN.update_url(this.props._self,"volumes")
   if (res['status']){
    message.success('修改成功！')}else{
      message.danger('修改失败')
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
          <FormItem label="备份名称" required name="name">
            <FormInput style={{width: '200px'}}></FormInput>
          </FormItem>
          <FormItem label="描述" name="desc" help="500个字符以内">
            <FormTextarea />
          </FormItem>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>修改
          </button>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleclose}>取消</button>
        </Form>
      </div>
    )
  }
})


const Backup_disk = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) return '请填写用户群'
      },
      date(v) {
        if (!v) return '日期不能为空'
      }
    }
    return {
      formData: {
        data: this.volumes_id(),
        method: 'backup'
      },
      volumes_id: this.volumes_id()
    }
  },
  volumes_id(){
    let volumes_id = {}
    let volumes_size = {}
    //console.log(this.props.volumes_all)
    for (let i in this.props.volumes_all) {
      // console.log(this.props.volumes_all[i])
      volumes_id['size'] = this.props.volumes_all[i]['size']
      volumes_id['name'] = this.props.volumes_all[i]['name']
      volumes_id['id'] = this.props.volumes_all[i]['id']
    }
    return volumes_id
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
    //console.log(this.state.formData)
    this.props._this.refs.modal.close()
    this.props._self.setState({loading:true})
    this.refs.form.save()
  },

  handleclose() {
    this.props._this.refs.modal.close()
  },

  handleSuccess(res) {
    this.props._self.setState({loading:false})
    if (res['status']){
    message.success('备份成功')}else{
    message.danger('备份失败')
    }
    OPEN.update_url(this.props._self,"volumes")
    this.props._self.setState({button_status:true})
    this.props._self.setState({button_statuss:true})
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
          <div>当你对正在运行的虚拟机或者已经绑定的云硬盘做在线备份时，需要注意以下几点：</div>
          <div>1. 备份只能捕获在备份任务开始时已经写入磁盘的数据，不包括当时位于缓存里的数据。</div>
          <div>2. 为了保证数据的完整性，先停止虚拟机或解绑云硬盘，进行离线备份。</div>
          <FormItem label="备份名称" required name="name">
            <FormInput style={{width: '200px'}}></FormInput>
          </FormItem>
          <FormItem label="描述" name="desc" help="500个字符以内">
            <FormTextarea />
          </FormItem>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建
          </button>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleclose}>取消</button>
        </Form>
      </div>
    )
  }
})

const Uninstall_disk = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    return {
      formData: {
        data: this.volumes_id(),
        method: 'uninstall'
      },
      column: [{
        title: '虚拟机',
        order: false,
        // width: '100px',
        key: 'host_name'
      }, {
        title: '设备名',
        key: 'device',
        order: false
      }
      ],

    }
  },
  volumes_id(){
    let volumes_id = {}
    let volumes_size = {}
    // console.log(this.props.volumes_all)
    for (let i in this.props.volumes_all) {
      //  console.log(this.props.volumes_all[i])
      volumes_id['size'] = this.props.volumes_all[i]['size']
      volumes_id['name'] = this.props.volumes_all[i]['name']
      volumes_id['id'] = this.props.volumes_all[i]['id']
      volumes_id['device'] = this.props.volumes_all[i]['device']
      volumes_id['host_id'] = this.props.volumes_all[i]['server_id']
      volumes_id['host_name'] = this.props.volumes_all[i]['servername']
    }
    return volumes_id
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
  //  console.log(this.state.formData)
    this.props._this.refs.modal.close()
    if (this.state.formData['data']['host_id']){
      this.props._self.setState({loading:true})
      this.refs.form.save()
    }else{
      message.danger('未挂载')
    }
  },

  handleSuccess(res) {
    this.props._self.setState({loading:false})
    if (res['status']){
    message.success('卸载成功')}else{
    message.danger('卸载失败')
    }
    OPEN.update_url(this.props._self,"volumes")
    this.props._self.setState({button_status:true})
    this.props._self.setState({button_statuss:true})
  },
  handleOpen() {
    this.refs.modal_m.open()
    // console.log(OPEN.UrlList()['instances'])
  },

  handleclose() {
    this.props._this.refs.modal.close()
  },

  render() {
    const {formData} = this.state
    let url = OPEN.UrlList()['volumes_post']
    let data = {
      totalList: [this.state.formData.data],
      totalPageNum: 2
    }
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
          <div>当前链接虚拟机</div>
          <DataTable
            url={this.state.url}
            showPage="false"
            data={data}
            column={this.state.column}
            howRow={10}
            onOrder={this.handleOrder}
            onCheckboxSelect={this.handleCheckboxSelect} ref="Table">
          </DataTable>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>卸载
          </button>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleclose}>取消</button>
        </Form>
      </div>
    )
  }
})

const Loading_disk = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    this.rules = {
      count(v) {
        if (!v) return '请填写用户群'
      },
      date(v) {
        if (!v) return '日期不能为空'
      },
      border(v){
        // console.log('.....v',v)
      },
      host1(v){
        // console.log('host1',v)
      },
    }
    return {
      formData: {
        method: 'Loading_disk',
        data: this.volumes_id()
      },
      dataTableDataArr: {}
    }
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },
  volumes_id(){
    let volumes_id = {}
    let volumes_size = {}
    //   console.log(this.props.volumes_all)
    for (let i in this.props.volumes_all) {
      //   console.log(this.props.volumes_all[i])
      volumes_id['size'] = this.props.volumes_all[i]['size']
      volumes_id['name'] = this.props.volumes_all[i]['name']
      volumes_id['id'] = this.props.volumes_all[i]['id']
    }
    return volumes_id
  },

  handleSave() {
    const formData = this.state.formData
    formData.host_id = this.refs.select.state['value']
    formData.host_name = this.refs.select.title
    this.setState({formData})
    this.props._this.refs.modal.close()
    this.props._self.setState({loading:true})
    this.refs.form.save()
  },

  handleSuccess(res) {
    this.props._self.setState({loading:false})
    if (res['status']){
    message.success('加载成功')}else{
    message.danger('加载失败')
    }
    OPEN.update_url(this.props._self,"volumes")
    this.props._self.setState({button_status:true})
    this.props._self.setState({button_statuss:true})
  },
  handleOpen() {
    // this.props._this.refs.modal.close()
    // console.log(OPEN.UrlList()['instances'])
  },
  componentWillMount: function () {
    OPEN.Get_instances(this, this.xhrCallback)
  },

  handleclose() {
    this.props._this.refs.modal.close()
  },

  xhrCallback: (_this, executedData) => {
    _this.setState({
      dataTableDataArr: executedData,
    })
  },
  render() {
    const {formData} = this.state
    let url = OPEN.UrlList()['volumes_post']
    let dataTableDataArr = this.state.dataTableDataArr
    let host = Object.keys(dataTableDataArr).map((itms, i)=> {
      return (<Option value={dataTableDataArr[itms]} key={i}>{itms}</Option>)
    })
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
          <div>注意：如果你需要在Linux系统启动时自动挂载硬盘，请不要使用在 /etc/fstab 中直接指定 /dev/sdc1 这样的写法， 因为在云中设备的顺序编码在关机、开机过程中可能发生改变，推荐使用 UUID 或者 LABEL 的方式来指定。</div>
          <FormItem label="加载到" name="brand">
            <Select searchable name="host1" ref="select">
              <Option>请选择</Option>
              {host}
            </Select>
          </FormItem>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>确定
          </button>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleclose}>取消</button>
        </Form>
      </div>
    )
  }
})

const Extend = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    this.rules = {
      count(v) {
        if (!v) return '请填写用户群'
      },
      date(v) {
        if (!v) return '日期不能为空'
      }
    }
    return {
      formData: {
        data: this.volumes_id(),
        method: 'amend'
      },
      volumes_id: this.volumes_id()
    }
  },
  volumes_id(){
    let volumes_id = {}
    let volumes_size = {}
    for (let i in this.props.volumes_all) {
      volumes_id['size'] = this.props.volumes_all[i]['size']
      volumes_id['name'] = this.props.volumes_all[i]['name']
      volumes_id['id'] = this.props.volumes_all[i]['id']
    }
    return volumes_id
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  handleSave() {
    this.props._this.refs.modal.close()
    this.props._self.setState({loading:true})
    this.refs.form.save()
  },

  handleclose() {
    this.props._this.refs.modal.close()
  },

  handleSuccess(res) {
    this.props._self.setState({loading:false})
    this.props._self.setState({button_statuss:true})
    if (res['status']==true){
    message.success('保存成功！')}else{
      if (res['status']=='error'){
        message.danger(res['totalList'])
      }else{
        message.danger('修改失败')
      }
    }
    OPEN.update_url(this.props._self,"volumes")
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
          <FormItem label="当前大小" name="name">
            <FormInput style={{width: '200px'}} disabled placeholder={this.volumes_id()['size']}></FormInput>
          </FormItem>
          <FormItem label="新大小" required name="count">
            <FormInput style={{width: '200px'}}></FormInput>
          </FormItem>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>修改
          </button>
          <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleclose}>取消</button>
        </Form>
      </div>
    )
  }
})

const Model_list = React.createClass({
  getInitialState() {
    return {
      title: '',
      module: '',
      volumes_id: '',
      volumes_size: '',
    }
  },
  values(){
    return {
      'Redact': "编辑云硬盘",
      'Extend': "扩展云硬盘",
      'Loading_disk': "加载云硬盘",
      'Uninstall_disk': "卸载云硬盘",
      'Backup_disk': '创建备份'
    }
  },
  modulevalue(){
    return {
      'Extend': <Extend volumes_all={this.props.select_all} _this={this} _self={this.props._this}/>,
      'Loading_disk': <Loading_disk volumes_all={this.props.select_all} _this={this}  _self={this.props._this}/>,
      'Uninstall_disk': <Uninstall_disk volumes_all={this.props.select_all} _this={this}  _self={this.props._this}/>,
      'Backup_disk': <Backup_disk volumes_all={this.props.select_all} _this={this}  _self={this.props._this}/>,
      'Redact': <Redact volumes_all={this.props.select_all} _this={this}  _self={this.props._this}/>,
    }
  },
  handleButtonClick(e) {
    //console.log('click left button', e)
  },
  handleMenuClick(e) {
    //console.log('click', e['key']);
    if (e["key"] == 'Loading_disk') {
      let module = this.modulevalue()[e["key"]]
      let volumes_id = {}
      let volumes_size = {}
      let status = ''
      for (let i in this.props.select_all) {
        volumes_id[this.props.select_all[i]['name']] = this.props.select_all[i]['id']
        volumes_size['size'] = this.props.select_all[i]['size']
        status = this.props.select_all[i]['servername']
      }
      if (!status) {
        this.setState({volumes_id, volumes_size})
        this.setState({title: this.values()[e['key']], module})
        this.refs.modal.open()
      } else {
        message.danger('已连接')
      }

    } else {
      let module = this.modulevalue()[e["key"]]
      // console.log(module)
      let volumes_id = {}
      let volumes_size = {}
      for (let i in this.props.select_all) {
        volumes_id[this.props.select_all[i]['name']] = this.props.select_all[i]['id']
        volumes_size['size'] = this.props.select_all[i]['size']
      }
      this.setState({volumes_id, volumes_size})
      this.setState({title: this.values()[e['key']], module})
      this.refs.modal.open()
    }

  },
  render() {
    const DropdownButton = Dropdown.Button;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="Redact" disabled={this.props.button_status}>编辑云硬盘</Menu.Item>
        <Menu.Item key="Extend" disabled={this.props.button_status}>扩展云硬盘</Menu.Item>
        <Menu.Item key="Loading_disk" disabled={this.props.button_status}>加载云硬盘</Menu.Item>
        <Menu.Item key="Uninstall_disk" disabled={this.props.button_status}>卸载云硬盘</Menu.Item>
        <Menu.Item key="Backup_disk" disabled={this.props.button_status}>创建备份</Menu.Item>
      </Menu>
    )
    return (
      <div>
        <DropdownButton onClick={this.handleButtonClick} overlay={menu} type="primary" trigger={['click']}>
          更多操作
        </DropdownButton>
        <div>
          <Modal ref="modal">
            <ModalHeader>
              <h4>{this.state.title}</h4>
            </ModalHeader>
            <ModalBody>
              {this.state.module}
            </ModalBody>
          </Modal>
        </div>
      </div>
    )
  }
})

export default Model_list