import React from 'react'
import {Menu, Dropdown as Dropdown1, Icon} from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Spin} from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import OPEN from '../data_request/request.js'
import Openstackconf from '../Conf/Openstackconf'
import ReactDOM from 'react-dom'
import TextOverflow from 'bfd/TextOverflow'
import update from 'react-update'
import { Form, FormItem, FormSubmit, FormInput, FormSelect, Option, FormTextarea } from 'bfd/Form'
import {Component} from 'react'
import message from 'bfd/message'

class Create_disk extends Component {
  constructor(props) {
    super()
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) return '请输入名字'
       // if (v.length > 5) return '用户群名称不能超过5个字符'
      },
      size(v) {
       if (!v) return '请输入数字'
       // if (v.length > 5) return '用户群名称不能超过5个字符'
      }
    }
    this.state = {
      formData: {
        method: 'snapshot_create'
      }
    }
  }

  componentWillMount(){
    console.log(this.props.snapshot,'111111')
    let snapshot=this.props.snapshot
    let formData=this.state.formData
    formData['id']=snapshot['id']
    formData['name']=snapshot['displayName']
    formData['snapshot']=0
    formData['type']=0
    formData['size']=snapshot['size'].toString()
    this.setState({formData})
  }

  handleDateSelect(date) {
    this.update('set', 'formData.date', date)
  }

  handleSuccess(res) {
    if (res['status']){
      message.success('创建成功')
    }else{
      message.success('创建失败')
    }
    
  }

  render() {
   // let formData1=this.props.formData
    //formData1['id']=this.props.snapshot['id']
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    let snapshot=this.props.snapshot['displayName']
  //  this.setState({formData:formData1})
    return (
      <Form 
        action={url}
        data={formData} 
        onChange={formData => this.update('set', { formData })}
        rules={this.rules} 
        onSuccess={::this.handleSuccess}
      >
        <FormItem label="云盘名称" required name="name">
          <FormInput />
        </FormItem>
        <FormItem label="快照源" name="snapshot">
          <FormSelect style={{width: "183px"}}>
            <Option value={0}>{snapshot}</Option>
          </FormSelect>
        </FormItem>
        <FormItem label="类型" name="type" >
          <FormSelect style={{width: "183px"}}>
            <Option value={0}>未选择云类型</Option>
            <Option value={1}>ceph</Option>
          </FormSelect>
        </FormItem>
        <FormItem label="云盘大小" required name="size">
          <FormInput />
        </FormItem>
        <FormItem label="描述" name="desc" help="500个字符以内">
          <FormTextarea style={{width: "260px"}}/>
        </FormItem>
        <FormSubmit>创建</FormSubmit>
      </Form>
    )
  }
}


class Snapshot_delete extends Component {
  constructor(props) {
    super()
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) return '请输入名字'
       // if (v.length > 5) return '用户群名称不能超过5个字符'
      },
      size(v) {
       if (!v) return '请输入数字'
       // if (v.length > 5) return '用户群名称不能超过5个字符'
      }
    }
    this.state = {
      formData: {
        method: 'snapshot_create'
      }
    }
  }

  componentWillMount(){
    console.log(this.props.snapshot,'111111')
    let snapshot=this.props.snapshot
    let formData=this.state.formData
    formData['id']=snapshot['id']
    formData['name']=snapshot['displayName']
    formData['snapshot']=0
    formData['type']=0
    formData['size']=snapshot['size'].toString()
    this.setState({formData})
  }

  handleDateSelect(date) {
    this.update('set', 'formData.date', date)
  }

  handleSuccess(res) {
    if (res['status']){
      message.success('创建成功')
    }else{
      message.success('创建失败')
    }
    
  }

  render() {
   // let formData1=this.props.formData
    //formData1['id']=this.props.snapshot['id']
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    let snapshot=this.props.snapshot['displayName']
  //  this.setState({formData:formData1})
    return (
      <Form 
        action={url}
        data={formData} 
        onChange={formData => this.update('set', { formData })}
        rules={this.rules} 
        onSuccess={::this.handleSuccess}
      >
        <span>删除{snapshot}</span>
        <FormSubmit>删除</FormSubmit>
      </Form>
    )
  }
}


export default React.createClass({
  getInitialState: function () {
    return {
      loading: false,
      title:'',
      modal:'',
      snapshot:'',
      url: OPEN.UrlList()['volumes_post'] + '?name=backup',
      column: [{
        title: '名称',
        order: false,
        key: 'displayName'
      }, {
        title: '描述',
        key: 'displayDescription',
        order: false
      }, {
        title: '大小',
        key: 'size',
        order: false,
        render: (text, item) => {
          return (
            <div>
              <TextOverflow><p style={{width: '204px'}}>{text}GB</p>
              </TextOverflow>
            </div>)
        }
      }, {
        title: '状态',
        key: 'status',
        order: false
      }, {
        title: '硬盘名称',
        key: 'volume_name',
        order: false,
      }, {
        title: '操作',
        key: 'componentWillMount_sn',
        order: false,
        //   width: "18.25%"
        render: (item, component) => {
          const menu = (
            <Menu onClick={this.handleMenuClick.bind(this,component)}>
              <Menu.Item key="1">编辑快照</Menu.Item>
              <Menu.Item key="snapshot_delete">删除云盘快照</Menu.Item>
            </Menu>
          );
          return (<Dropdown1.Button onClick={this.handleButtonClick.bind(this,component)} overlay={menu} type="ghost"  trigger={['click']}>创建云硬盘</Dropdown1.Button>)
        },
      }
      ]
    }
  },
  handleOpen(name) {
    //console.log(this.state.images_list)
  },

  handleRowClick(row) {
  //  this.setState({snapshot:row})
  },

  handleButtonClick(e) {
   // this.setState({snapshot:e})
    this.refs.modal.open()
    let title=this.values()['create_disk']
    let modal=this.modulevalue(e)['create_disk']
    console.log(title,modal)
    this.setState({title,modal})
  },

  handleMenuClick(e,event) {
    console.log(e,'1111111')
    console.log(event,'1111111')
    this.refs.modal.open()
    let title=this.values()[event['key']]
    let modal=this.modulevalue(e)[event['key']]
    this.setState({title,modal})
  },

   values(){
    return {
      'create_disk': "创建云硬盘",
       'snapshot_delete': "删除云硬盘"
    }
  },
  modulevalue(e){
    return {
      'create_disk': <Create_disk snapshot={e}/>,
      'snapshot_delete': <Snapshot_delete snapshot={e}/>,
    }
  },

  componentDidMount(){
    let table_trlengt = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totallength = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].childNodes.length
    let tdheight = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].scrollHeight
    let height_table = (totallength) * tdheight
    let totalwidth = (ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].clientWidth - 17) / table_trlengt
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let backup_nav = ReactDOM.findDOMNode(this.refs.backup_nav).clientHeight
    let backup_bu = ReactDOM.findDOMNode(this.refs.backup_bu).clientHeight
    totalHeight = totalHeight - backup_nav - backup_bu - 120
    ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].style.height = totalHeight + 'px'
    if (totalHeight > height_table) {
      for (let i = 0; i < ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length; i++) {
        if (i == (table_trlengt - 1)) {
          totalwidth = totalwidth + 17
          ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width = totalwidth + 'px'
        } else {
          ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width = totalwidth + 'px'
        }
      }
    }
  },
  requestArgs: {
    pageName: "backup",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this)
    return (
      <div className="function-data-moduleA">
        <NavigationInPage ref="backup_nav" headText={Openstackconf.getNavigationDatav({
          pageName: this.requestArgs.pageName,
          type: "headText"
        })} naviTexts={Openstackconf.getNavigationDatav({
          pageName: this.requestArgs.pageName,
          type: "navigationTexts",
          spaceName: spaceName
        })}/>
        <Spin spinning={this.state.loading}>
          <div ref="backup_bu">
            <Button onClick={this.handleOpen.bind(this, 5)} style={{margin: '0px 10px 0px 0px'}}>刷新</Button>
          </div>
          <div className="DataTableFatherDiv_backup">
            <DataTable
              url={this.state.url}
              showPage="false"
              column={this.state.column}
              howRow={10}
              onOrder={this.handleOrder}
              onRowClick={this.handleRowClick}
              onCheckboxSelect={this.handleCheckboxSelect} ref="Table">
            </DataTable>
          </div>
          <div>
            <Modal ref="modal">
              <ModalHeader>
                <h4>{this.state.title}</h4>
              </ModalHeader>
              <ModalBody>
                {this.state.modal}
              </ModalBody>
            </Modal>
          </div>
        </Spin>
      </div>
    )
  }
})