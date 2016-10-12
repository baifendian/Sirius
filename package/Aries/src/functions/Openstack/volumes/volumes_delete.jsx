import message from 'bfd-ui/lib/message'
import React from 'react'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import Button from 'bfd-ui/lib/Button'
import OPEN from '../data_request/request.js'
import { Form, FormItem, FormSubmit, FormInput, FormSelect, Option, FormTextarea } from 'bfd/Form'
import update from 'react-update'

const Delete_volumes = React.createClass({
  getInitialState() {
    this.update = update.bind(this)
    return {
      volumes_object: 'test',
      formData: {
        method: 'delete',
        volumes_object: {}
      },
      volumes_name: ''
    }
  },
  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },
  handleSave() {
    this.props._this.setState({loading:true})
    this.refs.modal_m.close()
    this.refs.form.save()
  },

  handleSuccess(res) {
    console.log(res)
    this.refs.modal_m.close()
    this.props._this.setState({loading:false})
    let return_keys=Object.keys(res)[0]
    if (res[return_keys]){
    message.success('删除成功！')}else{
      message.danger('删除失败！')
    }
    OPEN.update_url(this.props._this,"volumes")
    this.props._this.setState({button_statuss:true})
  },
  handleOpen() {
    this.refs.modal_m.open()
    let volumes_object = {}
    let volumes_name = ''
    for (var i in this.props.select_all) {
      volumes_object[this.props.select_all[i]['id']] = this.props.select_all[i]['name']
      
      if (i==this.props.select_all.length-1){
        volumes_name = volumes_name +'"'+ this.props.select_all[i]['name']+'"'}else{
        volumes_name = volumes_name + '"'+this.props.select_all[i]['name']+'"' + '、'
      }
    }
    this.setState({volumes_name, formData: {volumes_object: volumes_object, method: 'delete'}})
  },

  handleclose() {
    this.refs.modal_m.close()
  },

  render() {
    const {formData} = this.state
    let url = OPEN.UrlList()['volumes_post']
    return (
      <div style={{float: "left", margin: "0px 10px 0px 0px"}}>
        <Button type="danger" className="btn btn-primary" onClick={this.handleOpen} disabled={this.props.button_statuss}>删除</Button>
        <Modal ref="modal_m">
          <ModalHeader>
            <h4>确认删除云硬盘</h4>
          </ModalHeader>
          <ModalBody>
            <Form
              ref="form"
              action={url}
              data={formData}
              rules={this.rules}
              onChange={formData => this.update('set', { formData })}
              onSuccess={this.handleSuccess}
            >
              <div style={{height: '100px'}}>
                <h4>确定要删除云硬盘{this.state.volumes_name}?</h4>
              </div>
              <div>
                <Button type="danger" style={{marginLeft: '100px'}} className="btn btn-primary"
                        onClick={this.handleSave}>确认</Button>
                <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.handleclose}>取消</button>
              </div>
            </Form>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

export {Delete_volumes}