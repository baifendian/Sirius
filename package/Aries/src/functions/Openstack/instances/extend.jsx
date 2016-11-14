import SearchInput from 'bfd-ui/lib/SearchInput'
import React from 'react'
import './index.less'
import './extend.less'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import OPEN from '../data_request/request.js'
import update from 'react-update'
import Button from 'bfd/Button'
import { Form, FormItem, FormSubmit, FormInput, FormSelect, Option, FormTextarea } from 'bfd/Form'
import message from 'bfd-ui/lib/message'
import Icon from 'bfd-ui/lib/Icon'
import {Row, Col} from 'bfd-ui/lib/Layout'
import xhr from 'bfd-ui/lib/xhr'
import {Spin} from 'antd'
import {Select, Option as Optionb} from 'bfd/Select'
import Input from 'bfd/Input'

const Extend = React.createClass({
  getInitialState() {
    return {
      _value: ""
    }
  },
  handleClick(value) {
    let _value = this.state._value
    let _property = this.refs.type_property.state.value
    if (!_property) {
      _property = "name"
    }
    let _url = OPEN.UrlList()['search'] + "?name=instances_search&keys=" + _property + "&value=" + _value
    this.props._this.setState({url: _url})
  },
  handleChange(value) {
    this.setState({'_value': value})
  },
  render() {
    return (
      <div>
        <Select ref="type_property" className="type_property">
          <Option >主机名</Option>
          <Option value="status">状态</Option>
          <Option value="image">镜像</Option>
          <Option value="flavor">类型</Option>
        </Select>
        <SearchInput className="extend_class" placeholder="请" onSearch={this.handleClick} onChange={this.handleChange}
                     size="sm" ref="type_input"/>
      </div>
    )
  }
})

const Create_model_disk = React.createClass({
  getInitialState() {
    return {
      disk_number: 3,
      number: 3
    }
  },
  add_disk(){
    let host_disk=this.props.disks_m.state.host_disk
    let formData = this.props.disks_m.state.formData
    let disk_number =this.state.disk_number
    for (let i=0; i<this.state.number;i++){
      let disk_name='disk'+i
      if (!host_disk.hasOwnProperty(disk_name)){
        host_disk[disk_name]='--'
        disk_number=disk_number-1
        break
      }
    }
    this.props.disks_m.setState({host_disk})
    this.setState({disk_number})
 //   this.props.disk_list()
  },

  delete_disk(item){
    let disk_number =this.state.disk_number
    let host_disk=this.props.disks_m.state.host_disk
    let formData = this.props.disks_m.state.formData
    disk_number=disk_number+1
    delete host_disk[item]
    delete formData[item]
    this.props.disks_m.setState({host_disk,formData})
    this.setState({disk_number})
  },

  render(){
    let nav = this.props.disks_m.state.host_disk ? Object.keys(this.props.disks_m.state.host_disk).map((item,str)=>{
      return (
        <div key={item}>
          <FormItem label="云硬盘" name={item} className="disk_create">
            <FormInput placeholder="10GB~1TB" ></FormInput><Icon type=" fa-times"
                                                                  onClick={this.delete_disk.bind(this,item)}/>
          </FormItem>
        </div>
        )
    }):<span></span>

    return (
      <div>
        <div>{nav}</div>
        <Icon type="plus-square" onClick={this.add_disk}/><span>您还可选配</span><span
        className="disk_span">{this.state.disk_number}</span><span>块</span>
      </div>
    )
  }
})

const Create_model = React.createClass({
  handleOpen() {
    this.refs.modal.open()
    const self = this;
    xhr({
      type: 'GET',
      url: 'v1/openstack/images/',
      success(data) {
        // console.log(data)
        self.setState(
          {host_images: data['name']}
        )
      }
    }),
    xhr({
      type: 'GET',
      url: 'v1/openstack/flavors/',
      success(data) {
        self.setState({
          host_flavors: data['name'],
          loading: false
        })
      }
    })
  },
  
  getInitialState() {
    const self = this;
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) {
          return '名称不能为空'
        } else {
          self.setState({
            host_name: v
          })
        }
      },
      disk0(v){
        if (!v) {
          return '不能为空'
        } else {
          v = v + "GB"
          let host_disk=self.state.host_disk
          host_disk['disk0']=v
          self.setState({host_disk})
        }
      },
      disk1(v){
        if (!v) {
          return '不能为空'
        } else {
          let host_disk=self.state.host_disk
          host_disk['disk1']=v+'GB'
          self.setState({host_disk})
        }
      },
      disk2(v){
        if (!v) {
          return '不能为空'
        } else {
          let host_disk=self.state.host_disk
          host_disk['disk2']=v+"GB"
          self.setState({host_disk})
        }
      },
      images(v){
        self.setState({
          host_image: self.state.host_images[v]
        })
      },
      count(v){
        if (!v) {
          return '不能为空'
        } else {
          self.setState({
            host_count: v
          })
        }
      },
      type(v){
        //console.log(v)
        xhr({
          type: 'POST',
          url: 'v1/openstack/flavors/',
          data: {
            method: 'single',
            'id': v
          },
          success(data) {
            let cpu = data['cpu']
            let men = data['ram']
            let host = data['count']
            self.setState({
              host_cpu: cpu + "核",
              host_men: men + "MB",
              host_flavor_name: data['name']
            });
          }
        })
      },
    }
    return {
      formData: {
        brand: 0,
        method: 'create'
      },
      host_cpu: '--',
      host_men: '--',
      host_images: [],
      host_flavors: [],
      host_name: '--',
      host_flavor_name: '--',
      host_image: '--',
      host_count: '--',
      host_disks: [],
      loading: true,
      host_disk: {}
    }
  },
/*  componentWillMount: function () {
    const self = this;
    xhr({
      type: 'GET',
      url: 'openstack/images/',
      success(data) {
        // console.log(data)
        self.setState(
          {host_images: data['name']}
        )
      }
    }),
    xhr({
      type: 'GET',
      url: 'openstack/flavors/',
      success(data) {
        self.setState({
          host_flavors: data['name'],
          loading: false
        })
      }
    })
  },*/

  handleDateSelect(date) {
    const formData = this.state.formData
    formData.date = date
    this.setState({formData})
  },

  disk_list(){
    let self=this
    let rules=this.rules
    let bb= this.state.host_disk ? Object.keys(this.state.host_disk).map((item,i)=>{
      rules[item] = function item(v){ if (!v) {return '不能为空'} else {let host_disk=self.state.host_disk;host_disk[item]=v+"GB";self.setState({host_disk})}}
    }):null
   this.setState({rules})
  },

  handleSave() {
    this.refs.form.save()
    this.refs.modal.close()
    this.props._this.setState({loading: true})
  },

  handleCancel() {
    this.refs.modal.close()
  },

  handleSuccess(res) {
    this.props._this.setState({loading: false, url: "v1/openstack/bfddashboard/instances/?" + Math.random()})
    if (res['status']){
      message.success('创建成功!')}else{
      message.danger('创建失败!')
    }
  },
  disk_value(name){
  },

  render() {
    let images = this.state.host_images;
    let flavor = this.state.host_flavors;

    let disk=Object.keys(this.state.host_disk).map((item,i)=>{
      return (
        <div key={i}>{this.state.host_disk[item]}</div>
      )
    })

    const {formData} = this.state

    return (
      <div style={{float: "left", margin: '0px 10px 0px 0px'}}>
        <Button className="" onClick={this.handleOpen}>创建</Button>
        <Modal ref="modal">
          <ModalHeader>
            <h2>虚拟机创建</h2>
          </ModalHeader>
          <ModalBody className="">
            <div >
              <Spin spinning={this.state.loading}>
                <div className="right_host">
                  <div style={{padding: "10px"}}>
                    <h4>信息展示</h4>
                  </div>
                  <div className="border_right"></div>
                  <Row style={{margin: "5px 0px 0px 0px"}}>
                    <Col col="md-4">名称</Col>
                    <Col col="md-8">{this.state.host_name}</Col>
                  </Row>
                  <Row style={{margin: "5px 0px 0px 0px"}}>
                    <Col col="md-4">数量</Col>
                    <Col col="md-8">{this.state.host_count}</Col>
                  </Row>
                  <Row style={{margin: "5px 0px 0px 0px"}}>
                    <Col col="md-4">类型</Col>
                    <Col col="md-8">{this.state.host_flavor_name}</Col>
                  </Row>
                  <Row style={{margin: "5px 0px 0px 0px"}}>
                    <Col col="md-4">vCPU</Col>
                    <Col col="md-8">{this.state.host_cpu}</Col>
                  </Row>
                  <Row style={{margin: "5px 0px 0px 0px"}}>
                    <Col col="md-4">内存</Col>
                    <Col col="md-8">{this.state.host_men}</Col>
                  </Row>
                  <Row style={{margin: "5px 0px 0px 0px"}}>
                    <Col col="md-4">镜像</Col>
                    <Col col="md-8">{this.state.host_image}</Col>
                  </Row>
                  <Row style={{margin: "5px 0px 0px 0px"}}>
                    <Col col="md-4">云硬盘</Col>
                    <Col col="md-8">
                      {disk}
                    </Col>
                  </Row>
                </div>
                <div>
                  <Form
                    ref="form"
                    action="v1/openstack/bfddashboard/instances/"
                    data={formData}
                    rules={this.rules}
                    onChange={formData => this.update('set', { formData })}
                    onSuccess={this.handleSuccess}
                  >
                    <FormItem label="名称" required name="name" placeholder={this.state.host_name} help="">
                      <FormInput style={{width: '200px'}}></FormInput>
                    </FormItem>
                    <FormItem label="数量" required name="count" help="">
                      <FormInput style={{width: '200px'}}></FormInput>
                    </FormItem>
                    <FormItem label="类型" name="type">
                      <FormSelect style={{width: '200px'}}>
                        <Option>请选择</Option>
                        {Object.keys(flavor).map((str, i)=> {
                          if (str != "totalList") {
                            return (<Option value={str} key={i}>{flavor[str]}</Option>)
                          }
                        })}
                      </FormSelect>
                    </FormItem>
                    <FormItem label="镜像" name="images">
                      <FormSelect style={{width: '200px'}}>
                        <Option>请选择</Option>
                        {Object.keys(images).map((str, i)=> {
                          return (<Option value={str} key={i}>{images[str]}</Option>)
                        })
                        }
                      </FormSelect>
                    </FormItem>
                    <FormItem label="磁盘" name="name1">
                      <Create_model_disk disks_m={this} disk_list={this.disk_list}/>
                    </FormItem>
                    <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary"
                            onClick={this.handleSave}>创建
                    </button>
                    <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary"
                            onClick={this.handleCancel}>取消
                    </button>
                  </Form>
                </div>
             </Spin>
            </div>
          </ModalBody>
        </Modal>
      </div>
    )
  }
})

const Progress_model = React.createClass({
  getInitialState() {
    return {
      percent: 0,
      status: this.props.title_status,
    };
  },

  componentWillMount(){
  const _this=this
  let url = OPEN.UrlList()['instances']+"?name="+this.props.text['id']
  let interval=setInterval(function(){
  xhr({
      type: 'GET',
      url: url,
      async:false,
      success(data) {
        //console.log(data)
        if (data['status']=="ACTIVE" || data['status'] == "ERROR" || data['status']=="SHUTOFF") {
            _this.setState({status:data['status']})
            clearTimeout(interval)
        }
    }
    })
    },5000)

  },


  increase() {
    let percent = this.state.percent + 10;
    if (percent > 100) {
      percent = 100;
    }
    this.setState({percent});
  },
  decline() {
    let percent = this.state.percent - 10;
    if (percent < 0) {
      percent = 0;
    }
    this.setState({percent});
  },
  render() {
    return (
      <div>
        <span>{this.state.status}</span>
      </div>
    );
  },
})

export {Extend, Create_model, Progress_model}