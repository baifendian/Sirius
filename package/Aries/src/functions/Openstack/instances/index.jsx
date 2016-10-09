import React from 'react'
import {Menu, Dropdown as Dropdown1, Icon as Iconant} from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import {Modal, ModalHeader, ModalBody} from 'bfd-ui/lib/Modal'
import {Dropdown, DropdownToggle, DropdownMenu} from 'bfd-ui/lib/Dropdown'
import xhr from 'bfd-ui/lib/xhr'
import {Spin} from 'antd'
import OPEN from '../data_request/request.js'
import DataTable from 'bfd-ui/lib/DataTable'
import message from 'bfd-ui/lib/message'
import {Extend, Create_model, Progress_model}from './extend'
import {Disk_model} from './model_list'
import {Icon} from 'antd'
import './jquery.min.js'
import NavigationInPage from 'public/NavigationInPage'
import ReactDOM from 'react-dom'
import Openstackconf from '../Conf/Openstackconf'
import TextOverflow from 'bfd/TextOverflow'
import {SplitPanel, SubSplitPanel} from 'bfd/SplitPanel'
import {Tabs_List} from './instanses_tabs'


export default React.createClass({
  getInitialState: function () {
    return {
      title_status:'内容加载中',
      text_text: "",
      host_list: [],
      host_list_id: [],
      host_status: '',
      host_post: '',
      loading: false,
      select_all: [],
      select_host: '',
      host_desc: '',
      button_status: "disabled",
      url_vnc: "",
      height_h: "",
      button_statuss: true,
      url: "openstack/bfddashboard/instances/",
      column: [{
        title: '名称',
        order: false,
        render: (text, item) => {
          let path = "/openstack/" + item['id'] + '/'
          return (
            <div>
              <div>
                <a href="#">
                  <TextOverflow>
                    <p style={{width: '110px'}}>{text} </p>
                  </TextOverflow>
                </a>
              </div>
              <div>
                <a href="javascript:void(0);" style={{}} onClick={this.requestvnc.bind(this, 1, item['id'])}><Icon
                  type="desktop"/></a>
              </div>
            </div>
          )
        },
        key: 'name'
      }, {
        title: '类型',
        key: 'flavor',
        order: false
      }, {
        title: '镜像名',
        key: 'image',
        order: false
      }, {
        title: 'IP地址',
        key: 'ip',
      }, {
        title: '状态',
        key: 'status',
        order: false,
        render: (text, item)=> {
          // console.log('text_text',text)
           if (text=="ACTIVE" || text == "ERROR" || text=="SHUTOFF"){return (<span>{text}</span>)}else{
           return (<div><Progress_model text={item} title_status={this.state.title_status}/></div>)}
          //return (<span>{text}</span>)
        }
      }, {
        title: '创建时间',
        key: 'created',
        order: false,
      }
      ]
    }
  },
  handleClick(item, event) {
    event = event ? event : window.event;
    event.stopPropagation();
    this.refs.modal.open()
  },
  onPageChange(page) {
  },
  requestvnc(id, return_data, e){
    this.setState({loading: true})
    if (id == '1') {
      OPEN.open_vnc(this, return_data, this.requestvnc);
    } else {
      if (return_data['console']['url'] == false) {
        message.danger('vnc故障请联系管理员')
        id.setState({loading: false})
      } else {
        this.refs.model_disk.open()
        id.setState({loading: false, url_vnc: return_data['console']['url']})
      }
      ReactDOM.findDOMNode(this.refs.iFrame).childNodes[0].focus()
    }
  },
  handleCheckboxSelect(selectedRows) {
    if (selectedRows.length == 1) {
      this.setState({
        button_statuss: false
      })
    } else {
      this.setState({
        button_statuss: true
      })
    }
    let arr = []
    let arr_id = []
    for (var i = 0; i < selectedRows.length; i++) {
      arr.push(selectedRows[i]['name'])
    }
    for (var i = 0; i < selectedRows.length; i++) {
      arr_id.push(selectedRows[i]['id'])
    }
    let b = ' '
    let button_s = (selectedRows.length == 0) ? 'disabled' : false
    this.setState({
      host_list: arr,
      host_list_id: arr_id,
      button_status: button_s,
      select_all: selectedRows
    })
  },
  count_height(){
    let table_trlengt = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totallength = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].childNodes.length
    let tdheight = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].scrollHeight
    let height_table = (totallength + 1) * tdheight
    let totalwidth_t = ReactDOM.findDOMNode(this.refs.instances_bu).clientWidth
    //let totalwidth=(ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].clientWidth-32.5)/table_trlengt
    let totalwidth = (ReactDOM.findDOMNode(this.refs.instances_bu).clientWidth - 34 - 17) / table_trlengt
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let instances_nav = ReactDOM.findDOMNode(this.refs.instances_nav).clientHeight
    let instances_bu = ReactDOM.findDOMNode(this.refs.instances_bu).clientHeight
    let totalHeight1 = totalHeight - 120
    totalHeight = totalHeight - instances_nav - instances_bu - 140 - 93
    let totalHeight2 = totalHeight + 82
    this.setState({height_h: totalHeight})
    ReactDOM.findDOMNode(this.refs.SplitPanel).style.height = totalHeight1 + "px"
    ReactDOM.findDOMNode(this.refs.SplitPanel).childNodes[0].style.height = totalHeight2 + "px"
    ReactDOM.findDOMNode(this.refs.SplitPanel).childNodes[1].style.top = totalHeight2 + "px"
    ReactDOM.findDOMNode(this.refs.Table_t).childNodes[0].style.width = totalwidth_t + 'px'
    ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].style.height = totalHeight + 'px'
    ReactDOM.findDOMNode(this.refs.Tabs_list).childNodes[1].style.height=(totalHeight1-totalHeight2-35)+'px'
    if (totalHeight <= height_table) {
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
  count_initialization(){
    let table_trlengt = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totallength = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].childNodes.length
    let tdheight = ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].scrollHeight
    let height_table = (totallength + 1) * tdheight
    // let totalwidth=(ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].clientWidth-32.5)/7
    let totalwidth_t = ReactDOM.findDOMNode(this.refs.instances_bu).clientWidth
    let totalwidth = (ReactDOM.findDOMNode(this.refs.instances_bu).clientWidth - 34 - 17) / table_trlengt
    // console.log(ReactDOM.findDOMNode( this.refs.instances_bu).clientWidth)
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let instances_nav = ReactDOM.findDOMNode(this.refs.instances_nav).clientHeight
    let instances_bu = ReactDOM.findDOMNode(this.refs.instances_bu).clientHeight
    let totalHeight1 = totalHeight - 120
    totalHeight = totalHeight - instances_nav - instances_bu - 140 - 10
    let totalHeight2 = totalHeight + 82
    ReactDOM.findDOMNode(this.refs.SplitPanel).style.height = totalHeight1 + "px"
    ReactDOM.findDOMNode(this.refs.SplitPanel).childNodes[0].style.height = totalHeight1 + "px"
    ReactDOM.findDOMNode(this.refs.SplitPanel).childNodes[1].style.top = totalHeight1 + "px"
    ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[1].style.height = totalHeight + 'px'
    ReactDOM.findDOMNode(this.refs.Table_t).childNodes[0].style.width = totalwidth_t + 'px'
    if (totalHeight <= height_table) {
      // ReactDOM.findDOMNode( this.refs.Table_t).childNodes[0].style.width=totalwidth_t+'px'
      // ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
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
  handleRowClick(row) {
     if (row == this.state.host_desc){
      this.setState({host_desc: ''})
      this.count_initialization()
     }else{
      this.setState({host_desc: row})
      this.count_height()
     }
  },
  handleOrder(name, sort) {
  },
  callback_status(name){
    this.handleOpen(name)
  },
  handleOpen(name) {
    let text = ''
    switch (name) {
      case 1:
        OPEN.posthoststop(this, 'instances', this.state.select_all, "start")
        break;
      case 2:
         text = '确定要重启虚拟机'
        this.refs.modal.open()
        for (var i = 0; i < this.state.host_list.length; i++) {
          if (i==this.state.host_list.length-1){
          text = text + '"' + this.state.host_list[i] + '"' +'？'}else{
           text = text + '"' + this.state.host_list[i] + '"'+'、'
          }
        }
        this.setState({
          text_text: text,
          host_status: "重启虚拟机",
          host_post: 'restart',
          title_status: "正在重启"
        })
        break;
      case 3:
       text = '确定要关闭虚拟机'
        this.refs.modal.open()
        for (var i = 0; i < this.state.host_list.length; i++) {
          if (i==this.state.host_list.length-1){
          text = text + '"' + this.state.host_list[i] + '"'+'?'}else{
           text = text + '"' + this.state.host_list[i] + '"'+'、'
          }
        }

        this.setState({
          text_text: text,
          host_status: "关闭虚拟机",
          host_post: 'stop',
          title_status: "正在关闭"
        })
        break;
      case 4:
        text = '确定要删除虚拟机'
        this.refs.modal.open()
        for (var i = 0; i < this.state.host_list.length; i++) {
          if (i==this.state.host_list.length-1){
          text = text + '"' + this.state.host_list[i] + '"' +'?'}else{
           text = text + '"' + this.state.host_list[i] + '"'+'、'
          }
        }
        this.setState({
          text_text: text,
          host_status: "删除虚拟机",
          host_post: 'delete',
          title_status: "正在删除"
        })
        break;
      case 5:
        this.setState({
          url: ("openstack/bfddashboard/instances/?" + Math.random()),
          button_status: true
        })
    }

  },
  handleclean(name) {
    if (name == "clean") {
      this.refs.modal.close()
    } else {
      this.refs.modal.close()
      OPEN.posthoststop(this, 'instances', this.state.select_all, this.state.host_post)
    }
  },
  handleOpen_re() {
    this.refs.modal.open()
    this.setState({test: "重启"})
  },
  disk_model_open(){
    this.refs.model_disk.open()
  },
  componentDidMount(){
    window.onresize = ()=> {
      if (this.state.host_desc) {
        this.count_height()
      } else {
        this.count_initialization()
      }
    }
    this.count_initialization()
  },
  handleSplit(){
    let hand_height=ReactDOM.findDOMNode(this.refs.SplitPanel).childNodes[2].style.height
    hand_height=hand_height.split('p')[0]-35
    ReactDOM.findDOMNode(this.refs.Tabs_list).childNodes[1].style.height=hand_height+'px'
  },
  requestArgs: {
    pageName: "instances",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this)
    let height_ht = this.state.height_h
    return (
      <div className="function-data-moduleA">
        <NavigationInPage ref="instances_nav" headText={Openstackconf.getNavigationData({
          pageName: this.requestArgs.pageName,
          type: "headText"
        })} naviTexts={Openstackconf.getNavigationData({
          pageName: this.requestArgs.pageName,
          type: "navigationTexts",
          spaceName: spaceName
        })}/>
        <div className="class_extend">
          <Extend _this={this}/>
        </div>
        <Spin spinning={this.state.loading}>
          <div ref="instances_bu">
            <Button onClick={this.handleOpen.bind(this, 5)}
                    style={{float: "left", margin: '0px 10px 0px 0px'}}>刷新</Button>
            <Create_model _this={this}/>
            {/*<Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this, 1)} style={{float: "left"}}>启动</Button>
            <Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this, 2)} style={{float: "left"}}>重启</Button>
            <Button disabled={this.state.button_status} onClick={this.handleOpen.bind(this, 3)} style={{float: "left"}}>停止</Button>
            <Button disabled={this.state.button_status} type="danger" onClick={this.handleOpen.bind(this, 4)}
                    style={{float: "left"}}>删除</Button>*/}
            <Disk_model vm_list={this.state.select_all} ref="model_model" handleOpen={this.handleOpen} _this={this} button_status={this.state.button_status} button_statuss={this.state.button_statuss}/>
            {/*<div style={{float: 'right'}}>
             <Extend _this={this}/>
             </div>*/}
            <Modal ref="modal">
              <ModalHeader>
                <h4>{this.state.host_status}</h4>
              </ModalHeader>
              <ModalBody>
                <div>
                  <h4>{this.state.text_text}</h4>
                </div>
                <div className="openstack_button_si" >
                  <Button onClick={this.handleclean.bind(this, this.state.host_post)} >确定</Button>
                  <Button onClick={this.handleclean.bind(this, 'clean')} style={{margin:"0px 0px 0px 100px"}}>取消</Button>
                </div>
              </ModalBody>
            </Modal>
            <Modal ref="model_disk">
              <ModalHeader>
                <h4>vnc</h4>
              </ModalHeader>
              <ModalBody>
                <div>
                  <div id="iFrame" style={{}} ref="iFrame">
                    <iframe name="iFrame" width="760" height="615" src={this.state.url_vnc} scrolling="auto "
                            frameborder="0" style={{height: "436px"}}></iframe>
                  </div>
                </div>
              </ModalBody>
            </Modal>
          </div>
          <div style={{clear: "both"}}></div>
          <div ref="Table_t">
            <SplitPanel direct="hor" style={{border: '1px solid rgb(224, 224, 224)'}} onSplit={this.handleSplit}
                        ref="SplitPanel">
              <SubSplitPanel ref="SubSplitPanel">
                <div className="DataTableFatherDiv_instances">
                  <DataTable
                    url={this.state.url}
                    onPageChange={this.onPageChange}
                    showPage="false"
                    column={this.state.column}
                    howRow={8}
                    onRowClick={this.handleRowClick}
                    onOrder={this.handleOrder}
                    onCheckboxSelect={this.handleCheckboxSelect} ref="Table">
                  </DataTable>
                </div>
              </SubSplitPanel>
              <SubSplitPanel ref="SubSplitPanel_t">
                <Tabs_List host_desc={this.state.host_desc} ref="Tabs_list"/>
              </SubSplitPanel>
            </SplitPanel>
          </div>
        </Spin>
      </div>
    )
  }
})