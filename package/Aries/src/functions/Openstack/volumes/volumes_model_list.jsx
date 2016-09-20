import { Form, FormItem } from 'bfd-ui/lib/Form'
import FormInput from 'bfd-ui/lib/FormInput'
import FormTextarea from 'bfd-ui/lib/FormTextarea'
import { FormSelect, Option } from 'bfd-ui/lib/FormSelect'
import message from 'bfd-ui/lib/message'
import React from 'react'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Select, Option as Optionb} from 'bfd/Select'
import Button from 'bfd-ui/lib/Button'
import OPEN from '../data_request/request.js'
import DataTable from 'bfd/DataTable'
//import { Modal, ModalHeader, ModalBody } from 'bfd/Modal'

import { Menu, Dropdown } from 'antd';


const Backup_disk = React.createClass({
  getInitialState() {
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
    let volumes_id={}
    let volumes_size={}
    console.log(this.props.volumes_all)
    for (let i in this.props.volumes_all){
      console.log(this.props.volumes_all[i])
      volumes_id['size']=this.props.volumes_all[i]['size']
      volumes_id['name']=this.props.volumes_all[i]['name']
      volumes_id['id']=this.props.volumes_all[i]['id']
    }
    return volumes_id
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
    this.props._this.refs.modal.close()
    message.success('保存成功！')
  },
  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    console.log('aaa',this.props.volumes_all,this.state.volumes_id)
    return (
      <div >
            <Form 
              ref="form" 
              action={url}
              data={formData} 
              rules={this.rules} 
              onSuccess={this.handleSuccess}
            >
            <div><h4>此云硬盘已加载到虚拟机。在某些情况下，从已加载的云硬盘上做备份会导致备份损坏的情况。</h4></div>
            <div><h4>推荐卸载云硬盘后做备份。</h4></div>
              <FormItem label="备份名称" required name="name" >
                <FormInput style={{width: '200px'}} ></FormInput>
              </FormItem>  
              <FormItem label="描述" name="desc" help="500个字符以内">
                <FormTextarea />
              </FormItem>
              <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建</button>
            </Form>
      </div>
    )
  }
})

const Uninstall_disk=React.createClass({
  getInitialState() {
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
    let volumes_id={}
    let volumes_size={}
    console.log(this.props.volumes_all)
    for (let i in this.props.volumes_all){
      console.log(this.props.volumes_all[i])
      volumes_id['size']=this.props.volumes_all[i]['size']
      volumes_id['name']=this.props.volumes_all[i]['name']
      volumes_id['id']=this.props.volumes_all[i]['id']
      volumes_id['device']=this.props.volumes_all[i]['device']
      volumes_id['host_id']=this.props.volumes_all[i]['server_id']
      volumes_id['host_name']=this.props.volumes_all[i]['servername']
    }
    return volumes_id
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
    //this.refs.modal_m.close()
    this.props._this.refs.modal.close()
    message.success('保存成功！')
  },
  handleOpen() {
    this.refs.modal_m.open()
    console.log(OPEN.UrlList()['instances'])
  },

  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
  //  let data=this.state.formData.data
    let data = {
      totalList: [this.state.formData.data],
      totalPageNum: 2
    } 
     console.log('aa',data)
    console.log('aa',data.data)

    return (
      <div >
            <Form 
              ref="form" 
              action={url}
              data={formData} 
              rules={this.rules} 
              onSuccess={this.handleSuccess}
            >
            <div><h4>当前链接虚拟机</h4></div>
            <DataTable 
              url={this.state.url}
              showPage="false"
              data={data}
              column={this.state.column}
              howRow={10}
              onOrder={this.handleOrder}
              onCheckboxSelect={this.handleCheckboxSelect}  ref="Table">
            </DataTable>
              <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>卸载</button>
            </Form>
      </div>
    )
  }
})

const Loading_disk=React.createClass({
  getInitialState() {
    this.rules = {
      count(v) {
        if (!v) return '请填写用户群'
      },
      date(v) {
        if (!v) return '日期不能为空'
      },
    border(v){
      console.log('.....v',v)
    },
    host1(v){
      console.log('host1',v)
    },
    }
    return {
      formData: {
        method: 'Loading_disk',
        data: this.volumes_id()
      },
      dataTableDataArr:{}
    }
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({ formData })
  },
  volumes_id(){
    let volumes_id={}
    let volumes_size={}
    console.log(this.props.volumes_all)
    for (let i in this.props.volumes_all){
      console.log(this.props.volumes_all[i])
      volumes_id['size']=this.props.volumes_all[i]['size']
      volumes_id['name']=this.props.volumes_all[i]['name']
      volumes_id['id']=this.props.volumes_all[i]['id']
    }
    return volumes_id
  },

  handleSave() {
    console.log(this.state.formData)
    console.log(this.refs.select.state['value'])
    console.log(this.refs.select.title)
    const formData = this.state.formData
    formData.host_id = this.refs.select.state['value']
    formData.host_name=this.refs.select.title
    this.setState({ formData })
    this.refs.form.save()
  },

  handleSuccess(res) {
    console.log(res)
   // this.refs.modal_m.close()
   this.props._this.refs.modal.close()
    message.success('保存成功！')
  },
  handleOpen() {
   // this.props._this.refs.modal.close()
    console.log(OPEN.UrlList()['instances'])
  },
  componentWillMount: function(){
      OPEN.Get_instances(this,this.xhrCallback)
     },
  xhrCallback:(_this,executedData) => {
    _this.setState ( { 
      dataTableDataArr:executedData,
    })
  },
  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    let dataTableDataArr=this.state.dataTableDataArr
    let host=Object.keys(dataTableDataArr).map((itms,i)=>{
      return (<Option value={dataTableDataArr[itms]}  key={i}>{itms}</Option>)
    })
    return (
      <div >
            <Form 
              ref="form" 
              action={url}
              data={formData} 
              rules={this.rules} 
              onSuccess={this.handleSuccess}
            >
             <FormItem label="加载到" name="brand">
                 <Select searchable name="host1" ref="select">
                  <Option>请选择</Option>
                  {host}
                </Select>
              </FormItem>
              <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>确定</button>
            </Form>
      </div>
    )
  }
})

const Extend = React.createClass({
  getInitialState() {
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
    let volumes_id={}
    let volumes_size={}
    console.log(this.props.volumes_all)
    for (let i in this.props.volumes_all){
      console.log(this.props.volumes_all[i])
      volumes_id['size']=this.props.volumes_all[i]['size']
      volumes_id['name']=this.props.volumes_all[i]['name']
      volumes_id['id']=this.props.volumes_all[i]['id']
    }
    return volumes_id
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
    //this.refs.modal_m.close()
    this.props._this.refs.modal.close()
    message.success('保存成功！')
  },
  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    console.log('aaa',this.props.volumes_all,this.state.volumes_id)
    return (
      <div >
            <Form 
              ref="form" 
              action={url}
              data={formData} 
              rules={this.rules} 
              onSuccess={this.handleSuccess}
            >
              <FormItem label="当前大小" name="name" >
                <FormInput style={{width: '200px'}} disabled placeholder={this.volumes_id()['size']}></FormInput>
              </FormItem>  
              <FormItem label="新大小" required name="count" >
                <FormInput style={{width: '200px'}}></FormInput>
              </FormItem>
              <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>修改</button>
            </Form>
      </div>
    )
  }
})

const Model_list=React.createClass({
  getInitialState() {
    return {
       title:'',
       module:'',
       volumes_id:'',
       volumes_size:'',
    }
  },
  values(){
    return {
      'redact':"编辑云盘",
      'Extend':"扩展云硬盘",
      'Loading_disk':"加载云磁盘",
      'Uninstall_disk':"卸载云磁盘",
      'Backup_disk':'创建备份'
    }
  },
  modulevalue(){
    return {
      'Extend': <Extend volumes_all={this.props.select_all} _this={this}/>,
      'Loading_disk':<Loading_disk volumes_all={this.props.select_all} _this={this}/>,
      'Uninstall_disk':<Uninstall_disk volumes_all={this.props.select_all} _this={this}/>,
      'Backup_disk':<Backup_disk volumes_all={this.props.select_all} _this={this}/>
    }
  },
  handleButtonClick(e) {
    console.log('click left button', e);
  },
  handleMenuClick(e) {
    //console.log('click', e['key']);
    let module=this.modulevalue()[e["key"]]
   // console.log(module)
    let volumes_id={}
    let volumes_size={}
    console.log(this.props.select_all)
    for (let i in this.props.select_all){
      console.log(this.props.select_all[i])
      volumes_id[this.props.select_all[i]['name']]=this.props.select_all[i]['id']
      volumes_size['size']=this.props.select_all[i]['size']
    }
    console.log(volumes_size,volumes_id)
    this.setState({volumes_id,volumes_size})
    this.setState({title:this.values()[e['key']],module})
    this.refs.modal.open()

  },
  render() {
    const DropdownButton = Dropdown.Button;
    const menu = (
          <Menu onClick={this.handleMenuClick}>
            <Menu.Item key="1" disabled={this.props.button_status}>编辑云硬盘</Menu.Item>
            <Menu.Item key="Extend" disabled={this.props.button_status} >扩展云硬盘</Menu.Item>
            <Menu.Item key="Loading_disk" disabled={this.props.button_status}>加载硬盘</Menu.Item>
            <Menu.Item key="Uninstall_disk" disabled={this.props.button_status} >卸载硬盘</Menu.Item>
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