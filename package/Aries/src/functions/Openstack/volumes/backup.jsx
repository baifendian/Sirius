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
import xhr from 'bfd-ui/lib/xhr'
import { Progress } from 'antd';

class Snapshot_delete extends Component {
  constructor(props) {
    super()
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) return '请输入名字'
       // if (v.length > 5) return '用户群名称不能超过5个字符'
      }
    }
    this.state = {
      formData: {
        method: 'backup_delete'
      },
      disk_list:'',
      disk_object:'',
    }
  }

  componentWillMount(){
    let snapshot=this.props.snapshot
    let formData=this.state.formData
    formData['id']=snapshot['id']
    formData['name']=snapshot['name']
    this.setState({formData})

  }

  handleDateSelect(date) {
    this.update('set', 'formData.date', date)
  }

  handleSuccess(res) {
    this.props.self.refs.modal.close()
    this.props.refresh()
    if (res['status']){
      message.success('删除成功')
    }else{
      message.success('删除失败')
    }
    
  }

  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    let snapshot=this.props.snapshot['name']
    return (
      <Form 
        action={url}
        data={formData} 
        onChange={formData => this.update('set', { formData })}
        rules={this.rules} 
        onSuccess={::this.handleSuccess}
      >
        <div style={{height: '100px'}}><h4>确定要删除备份"{snapshot}"?</h4></div>
        <FormSubmit>确定</FormSubmit>
        <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.props.modalClose}>取消</button>
      </Form>
    )
  }
}

class Snapshot_extend extends Component {
  constructor(props) {
    super()
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) return '请输入名字'
       // if (v.length > 5) return '用户群名称不能超过5个字符'
      }
    }
    this.state = {
      formData: {
        method: 'backup_restore'
      },
      disk_list:'',
      disk_object:'',
    }
  }

  componentWillMount(){
    let snapshot=this.props.snapshot
    let formData=this.state.formData
    formData['id']=snapshot['id']
    this.setState({formData})
    let url=OPEN.UrlList()['volumes']
    let _this=this
  }

  handleSuccess(res) {
    this.props.self.refs.modal.close()
    this.props.refresh()
    if (res['status']){
      message.success('修改成功')
    }else{
      message.success('修改失败')
    }    
  }



  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    let snapshot=this.props.snapshot['displayName']
    let disk_object=this.state.disk_object
    return (
      <Form 
        action={url}
        data={formData} 
        onChange={formData => this.update('set', { formData })}
        rules={this.rules} 
        onSuccess={::this.handleSuccess}
      >
        <FormItem label="新云硬盘名称" required name="name">
          <FormInput />
        </FormItem>
        <FormItem label="新云硬盘" name="disk" style={{display:"none"}}>
          <FormSelect style={{width: "183px"}}>
            <Option >创建一个新的云硬盘</Option>
          </FormSelect>
        </FormItem>
        <FormSubmit>确定</FormSubmit>
         <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.props.modalClose}>取消</button>
      </Form>
    )
  }
}

class Snapshot_redact extends Component {
  constructor(props) {
    super()
    this.update = update.bind(this)
    this.rules = {
      name(v) {
        if (!v) return '请输入名字'
       // if (v.length > 5) return '用户群名称不能超过5个字符'
      }
    }
    this.state = {
      formData: {
        method: 'backup_restore'
      },
      disk_list:'',
      disk_object:'',
    }
  }

  componentWillMount(){
    let snapshot=this.props.snapshot
    let formData=this.state.formData
    formData['id']=snapshot['id']
    formData['disk']=snapshot['volume_id']
    formData['name']=snapshot['volume_name']
    this.setState({formData})
    let url=OPEN.UrlList()['volumes']
    let _this=this
   /*暂时保留 
   xhr({
      type: 'GET',
      url: url,
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
    })*/
  }

  handleSuccess(res) {
    this.props.self.refs.modal.close()
    this.props.refresh()
    if (res['status']){
      message.success('修改成功')
    }else{
      message.success('修改失败')
    }   
  }


  render() {
    const { formData } = this.state
    let url=OPEN.UrlList()['volumes_post']
    let volume_name=this.props.snapshot['volume_name']
    let backup_name=this.props.snapshot['name']
    let disk_object=this.state.disk_object
   /* let nav=Object.keys(disk_object).map((key,item)=>{
      return(<Option value={disk_object[key]} key={key}>{key}</Option>)
    })*/
    return (
      <Form 
        action={url}
        data={formData} 
        onChange={formData => this.update('set', { formData })}
        rules={this.rules} 
        onSuccess={::this.handleSuccess}
      >
        <div style={{height: '100px'}}><h4>是否把备份"{backup_name}"恢复到云硬盘"{volume_name}"?</h4></div>
        <FormSubmit>确定</FormSubmit>
         <button type="button" style={{marginLeft: '100px'}} className="btn btn-primary" onClick={this.props.modalClose}>取消</button>
      </Form>
    )
  }
}

const Progress_model = React.createClass({
  getInitialState() {
    return {
      percent: 0,
      status: false,
      status_s: this.props.text['status'],
    };
  },

  componentWillMount(){
  const _this=this
  let url = OPEN.UrlList()['volumes_post']+"?name=backup_t"+"&id="+this.props.text['id']
  let interval=setInterval(function(){
  xhr({
      type: 'GET',
      url: url,
      async:false,
      success(data) {
        if (data['status']!="restoring" && data['status'] != "creating") {
            _this.setState({status:true,status_s:data['status']})
            clearTimeout(interval)
        }
    }
  })   
  },10000)
  },
  render() {
    if (this.state.status){
    return (
      <div>
        <span>{this.state.status_s}</span>
      </div>
    )}else{
      if (this.state.status_s !='restoring'){
      return (
      <div>
        <Progress percent={100} showInfo={false} style={{width:'50%'}}/><div>创建中</div>
      </div>)}else{
      return  (<div> <Progress percent={100} showInfo={false} style={{width:'50%'}}/><div>恢复中</div></div>)
      }
    
    }
  },
})


export default React.createClass({
  getInitialState: function () {
    return {
      loading: false,
      title:'',
      modal:'',
      snapshot:'',
      url: OPEN.UrlList()['volumes_post'] + '?name=backup_t',
      column: [{
        title: '名称',
        order: false,
        key: 'name'
      }, {
        title: '描述',
        key: 'description',
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
        order: false,
        render:(text,item) =>{
           if (text !="restoring" && text !="creating"){return (<span>{text}</span>)}else{
           return (<div><Progress_model text={item} title_status={this.state.title_status}/></div>)}
        }
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
              <Menu.Item key="snapshot_extend">恢复到新云硬盘</Menu.Item>
              <Menu.Item key="snapshot_delete">删除备份</Menu.Item>
            </Menu>
          );
          return (<Dropdown1.Button onClick={this.handleButtonClick.bind(this,component)} overlay={menu} type="ghost"  trigger={['click']}>恢复备份</Dropdown1.Button>)
        },
      }
      ]
    }
  },

  handleButtonClick(e) {
    this.refs.modal.open()
    /*let title=this.values()['create_disk']
    let modal=this.modulevalue(e)['create_disk']
    this.setState({title,modal})*/

    if (e['volume_id']){
      let title=this.values()['snapshot_redact']
      let modal=this.modulevalue(e)['snapshot_redact']
      this.setState({title,modal})
    }else{
      let title=this.values()['snapshot_extend']
      let modal=this.modulevalue(e)['snapshot_extend']
      this.setState({title,modal})
    }
  },

  handleMenuClick(e,event) {
    this.refs.modal.open()
    let title=this.values()[event['key']]
    let modal=this.modulevalue(e)[event['key']]
    this.setState({title,modal})
  },

  refresh(){
    let url=OPEN.UrlList()['volumes_post'] + '?name=backup_t'+'&wd='+Math.random()
    this.setState({url})
  },

  modalClose(){
    this.refs.modal.close()
  },
   values(){
    return {
       'snapshot_delete': "删除云硬盘备份",
       'snapshot_redact': "恢复备份",
       'snapshot_extend': "恢复到新云硬盘"
    }
  },
  modulevalue(e){
    return {
      'snapshot_delete': <Snapshot_delete snapshot={e} self={this} refresh={this.refresh} modalClose={this.modalClose}/>,
      'snapshot_redact': <Snapshot_redact snapshot={e} self={this} refresh={this.refresh} modalClose={this.modalClose}/>,
      'snapshot_extend': <Snapshot_extend snapshot={e} self={this} refresh={this.refresh} modalClose={this.modalClose}/>
    }
  },

  componentDidMount(){
    try{
      let table_trlengt = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    }
    catch (err){
      let tdheight = ReactDOM.findDOMNode(this.refs.Table).scrollHeight
      let height_table = (totallength) * tdheight
      let totalHeight = document.body.clientHeight
      totalHeight -= document.getElementById('header').clientHeight
      totalHeight -= document.getElementById('footer').clientHeight
      let backup_nav = ReactDOM.findDOMNode(this.refs.backup_nav).clientHeight
      let backup_bu = ReactDOM.findDOMNode(this.refs.backup_bu).clientHeight
      totalHeight = totalHeight - backup_nav - backup_bu - 120
      ReactDOM.findDOMNode(this.refs.Table).style.height = totalHeight + 'px'
      return
    }
    let table_trlengt = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totallength = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].childNodes.length
    let tdheight = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].scrollHeight
    let height_table = (totallength) * tdheight
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
            <Button onClick={this.refresh} style={{margin: '0px 10px 0px 0px'}}>刷新</Button>
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