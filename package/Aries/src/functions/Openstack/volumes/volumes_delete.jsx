import { Form, FormItem } from 'bfd-ui07/lib/Form'
import FormInput from 'bfd-ui07/lib/FormInput'
import FormTextarea from 'bfd-ui07/lib/FormTextarea'
import { FormSelect, Option } from 'bfd-ui07/lib/FormSelect'
import message from 'bfd-ui07/lib/message'
import React from 'react'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import Button from 'bfd-ui/lib/Button'
import OPEN from '../data_request/request.js'

const Delete_volumes=React.createClass({
  getInitialState() {
    return {
      volumes_object:'test',
      formData: {
        method: 'delete',
        volumes_object: {}
      },
      volumes_name:''
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
    console.log(this.props.select_all)
    let volumes_object={}
    let volumes_name=''
    for (var i in this.props.select_all){
      console.log(i)
      volumes_object[this.props.select_all[i]['id']]=this.props.select_all[i]['name']
      volumes_name=volumes_name+this.props.select_all[i]['name']+'、'
    }
    console.log('tes1.......',volumes_name,volumes_object)
    this.setState({volumes_name,formData:{volumes_object:volumes_object,method: 'delete'}})
    console.log(this.state.formData)
  },

  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    console.log(url)
    return (
      <div style={{float:"left",margin: "0px 10px 0px 0px"}}>
      <Button type="danger" className="btn btn-primary" onClick={this.handleOpen}>删除</Button>
        <Modal ref="modal_m">
          <ModalHeader>
            <h4>确认 删除云磁盘</h4>
          </ModalHeader>
          <ModalBody>
            <Form 
              ref="form" 
              action={url}
              data={formData} 
              rules={this.rules} 
              onSuccess={this.handleSuccess}
            >
              <div style={{height:'100px'}}>
              	<h4>您已选择{this.state.volumes_name}。 请确认您的选择。这个动作不能撤消。</h4>
              </div>
              <div>
              <Button type="danger" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleSave}>删除</Button>
              </div>
            </Form>
        </ModalBody>
        </Modal>
      </div>
    )
  }
})

export {Delete_volumes}