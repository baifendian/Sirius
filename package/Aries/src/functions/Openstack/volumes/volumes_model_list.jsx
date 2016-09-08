import { Form, FormItem } from 'bfd-ui/lib/Form'
import FormInput from 'bfd-ui/lib/FormInput'
import FormTextarea from 'bfd-ui/lib/FormTextarea'
import { FormSelect, Option } from 'bfd-ui/lib/FormSelect'
import message from 'bfd-ui/lib/message'
import React from 'react'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Select, Option as Optionb} from 'bfd/Select'
//import Button from 'bfd-ui/lib/Button'
import OPEN from '../data_request/request.js'
//import { Modal, ModalHeader, ModalBody } from 'bfd/Modal'

import { Menu, Dropdown } from 'antd';

const Uninstall_disk=React.createClass({
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
        brand: 0,
        method: 'amend'
      }
    }
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
    this.refs.modal_m.close()
    message.success('保存成功！')
  },
  handleOpen() {
    this.refs.modal_m.open()
    console.log(OPEN.UrlList()['instances'])
  },

  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    console.log(url)
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
                 <table border="1">
                  <tr>
                    <th>Month</th>
                    <th>Savings</th>
                  </tr>
                  <tr>
                    <td>January</td>
                    <td>$100</td>
                  </tr>
                </table>
              </FormItem>
              <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建</button>
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
      }
    }
    return {
      formData: {
        brand: 0,
        method: 'Loading_disk'
      }
    }
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
    this.refs.modal_m.close()
    message.success('保存成功！')
  },
  handleOpen() {
    this.refs.modal_m.open()
    console.log(OPEN.UrlList()['instances'])
  },

  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    console.log(url)
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
                 <Select searchable>
                  <Option>请选择</Option>
                  <Option value="0">苹果</Option>
                  <Option value="1">三星</Option>
                  <Option value="2">小米</Option>
                </Select>
              </FormItem>
              <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建</button>
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
        brand: 0,
        method: 'amend'
      }
    }
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
    this.refs.modal_m.close()
    message.success('保存成功！')
  },
  handleOpen() {
    this.refs.modal_m.open()
    console.log(OPEN.UrlList()['instances'])
  },

  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    console.log(url)
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
                <FormInput style={{width: '200px'}} disabled></FormInput>
              </FormItem>  
              <FormItem label="新大小" required name="count" >
                <FormInput style={{width: '200px'}}></FormInput>
              </FormItem>
              <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>创建</button>
            </Form>
      </div>
    )
  }
})

const Model_list1=React.createClass({
  getInitialState() {
    return {
       title:'',
       module:'',
    }
  },
  values(){
    return {
      'redact':"编辑云盘",
      'Extend':"扩展云硬盘",
      'Loading_disk':"加载云磁盘",
      'Uninstall_disk':"卸载云磁盘"
    }
  },
  modulevalue(){
    return {
      'Extend': <Extend/>,
      'Loading_disk':<Loading_disk/>,
      'Uninstall_disk':<Uninstall_disk/>
    }
  },
  handleButtonClick(e) {
    console.log('click left button', e);
  },
  handleMenuClick(e) {
    console.log('click', e['key']);
    let module=this.modulevalue()[e["key"]]
    console.log(module)
    this.setState({title:this.values()[e['key']],module})
    this.refs.modal.open()

  },
  render() {
    const DropdownButton = Dropdown.Button;
    const menu = (
          <Menu onClick={this.handleMenuClick}>
            <Menu.Item key="1">编辑云硬盘</Menu.Item>
            <Menu.Item key="Extend">扩展云硬盘</Menu.Item>
            <Menu.Item key="Loading_disk">加载硬盘</Menu.Item>
            <Menu.Item key="Uninstall_disk">卸载硬盘</Menu.Item>
            <Menu.Item key="5">创建备份</Menu.Item>
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

export default Model_list1