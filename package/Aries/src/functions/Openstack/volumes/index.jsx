import React from 'react'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import {Create_volumes} from './volumes_create'
import {Delete_volumes} from './volumes_delete'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import { SplitPanel, SubSplitPanel } from 'bfd/SplitPanel'
import OPEN from '../data_request/request.js'
import ReactDOM from 'react-dom'
import Model_list from './volumes_model_list'
import Openstackconf from '../Conf/Openstackconf'
import {Spin} from 'antd'
import { Progress } from 'antd'
import xhr from 'bfd-ui/lib/xhr'

export default React.createClass({

   getInitialState: function () {
    return {      
      url: OPEN.UrlList()['volumes'],
      loading: false,
      select_all:'',
      button_status: true,
      button_statuss: true,
      column: [
      {
        title: '名称',
        render: (text, item) => {
          return (<a href="javascript:void(0);" onClick={this.handleClick.bind(this, item)}>
            <TextOverflow><p style={{width: '85px'}}>{text}</p>
            </TextOverflow></a>)
        },
        key: 'name'
      }, {
        title: '描述',
        key: 'displayDescription',
        render: (text, item) => {
          return (
            <TextOverflow><p style={{width: '85px'}}>{text}</p>
            </TextOverflow>)
        },
      }, {
        title: '状态',
        key: 'servername',
        render: (text, item) => {
          if (item['status'] !='backing-up' && item['status'] != 'restoring-backup'){
            if (text){
              return (<span>已连接到<TextOverflow><p style={{width: '100px'}}>{text}</p></TextOverflow></span>)
            }else{
              return(<span>未连接</span>)
            }
          }else{
            return (<div><Progress_model text={item}/></div>)
          }
        }
      }, {
        title: '盘符',
        key: 'device'      
      }, {
        title: '容量',
        key: 'size',
        render: (text, item) => {
          return (
            <div>
              <TextOverflow><p style={{width: '85px'}}>{text}GB</p>
              </TextOverflow>
            </div>)
        }
      }, {
        title: '类型',
        key: 'voumetype',
      }, {
        title: '备份时间',        
        key: 'backupd'
      },
      {
        title: '创建时间', 
        key: 'created',
      //  width: '12%'
      }
      ]
    }
  },
  handleClick(item, event) {
    event = event ? event : window.event;
    event.stopPropagation();
  }, 
  onPageChange(page) {
  },
  handleCheckboxSelect(selectedRows) {
    for (var i=0; i<selectedRows.length;i++){
     // console.log(selectedRows[i]['id'])
    }
    if (selectedRows.length == 1){
      this.setState({button_status:false})
    }else{
      this.setState({button_status:true})
    }
    if (selectedRows.length > 0){
      this.setState({button_statuss:false})
    }else{
      this.setState({button_statuss:true})
    }
    this.setState({select_all:selectedRows})
  },
  handleRowClick(row) {
   // console.log('rowclick', row)
  },
  handleOrder(name, sort) {
 //   console.log(name, sort)
  },
  refresh(){
    OPEN.update_url(this,"volumes")
    this.setState({button_statuss:true})
  },
  handleOpen() {
    let aa=ReactDOM.findDOMNode( this.refs.data_table )
    this.refs.modal.open()
  },
   handleclean() {
    this.refs.modal.close()
  },
  delete(){
    OPEN.volumes_data(this,this.state.select_all)
  },
  componentDidMount(){
    let table_trlengt=ReactDOM.findDOMNode(this.refs.volumes_table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totallength=ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].childNodes.length
    let tdheight=ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].scrollHeight
    let height_table=(totallength)*tdheight
    let totalwidth=(ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[0].clientWidth-17)/table_trlengt
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let volumes_nav = ReactDOM.findDOMNode(this.refs.volumes_nav).clientHeight
    let volumes_bu = ReactDOM.findDOMNode(this.refs.volumes_bu).clientHeight
    totalHeight = totalHeight - volumes_nav - volumes_bu - 120
    if (totalHeight>height_table){
      ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    }else{
    ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    for (let i=0;i < ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[0].childNodes[0].childNodes.length;i++){
      if (i==(table_trlengt-1)){
        totalwidth=totalwidth+17
        ReactDOM.findDOMNode(this.refs.volumes_table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width=totalwidth+'px'
      }else{
        ReactDOM.findDOMNode(this.refs.volumes_table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width=totalwidth+'px'
      }
    }
  }
  },
  requestArgs:{
    pageName : "volumes",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this)
    return (  
      <div className="function-data-moduleA">
        <Spin size="large" spinning={this.state.loading}>
        <NavigationInPage ref="volumes_nav" headText={Openstackconf.getNavigationDatav({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationDatav({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})}/>
        <div style={{margin: "0px 0px 5px 0px"}} ref="volumes_bu">
          <Button onClick={this.refresh} style={{float:'left'}}>刷新</Button>
          <Create_volumes _this={this}/>
          <Delete_volumes select_all={this.state.select_all} _this={this} button_statuss={this.state.button_statuss}/>
          <Model_list select_all={this.state.select_all} button_status={this.state.button_status} _this={this}/>
        </div>
        <div className="DataTableFatherDiv_t">
          <DataTable ref="data_table"
            url={this.state.url} 
            onPageChange={this.onPageChange} 
            showPage='false' 
            column={this.state.column} 
            howRow={8}
            onRowClick={this.handleRowClick}
            onOrder={this.handleOrder}
            onCheckboxSelect={this.handleCheckboxSelect} ref="volumes_table" >
          </DataTable>
        </div>
        </Spin>
      </div>
    )
  }
})



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
  let url = OPEN.UrlList()['volumes']+"?name="+this.props.text['id']
  let interval=setInterval(function(){
  xhr({
      type: 'GET',
      url: url,
      async:false,
      success(data) {
        if (data['status'] != 'backing-up' && data['status'] != 'restoring-backup') {
            _this.setState({status:true,status_s:data['status']})
            clearTimeout(interval)
        }
    }
  })   
  /* if ( _this.state.percent > 99){
      clearTimeout(interval)
    }
    else{
     _this.increase()
    }*/
    },10000)

  },
  render() {
    if (this.state.status){
    return (
      <div>
        <span>{this.state.status_s}</span>
      </div>
    )}else{
      if (this.state.status_s != 'restoring-backup'){
      return (
      <div>
        <Progress percent={100} showInfo={false} style={{width:'50%'}}/><div>创建备份</div>
      </div>
    )}else{
      return (
      <div>
        <Progress percent={100} showInfo={false} style={{width:'50%'}}/><div>备份恢复中</div>
      </div>
      )
      }
    }
  },
})