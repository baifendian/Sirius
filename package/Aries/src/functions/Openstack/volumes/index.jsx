import React from 'react'
//import Task from 'public/Task'
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


export default React.createClass({

   getInitialState: function () {
    return {      
      url: "openstack/volumes/",
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
          if (text){
            return (<span>已连接到<TextOverflow><p style={{width: '100px'}}>{text}</p></TextOverflow></span>)
          }else{
            return(<span>未连接</span>)
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
    //console.log(item)
  }, 
  onPageChange(page) {
     //TODO
    // console.log('aaaaa')
  },
  handleCheckboxSelect(selectedRows) {
    //console.log('rows:', selectedRows)
    //console.log(selectedRows.html())
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
    //console.log(ReactDOM.findDOMNode( this.refs.data_table ))
    let aa=ReactDOM.findDOMNode( this.refs.data_table )
  //  console.log(aa.childNodes[1].childNodes[1])
    //aa.childNodes[1].childNodes[1].style.height="100px"
    //aa.childNodes[1].childNodes[1].style.overflow="auto"
    this.refs.modal.open()
    //console.log(this.refs.modal.getDOMNode())
    // console.log(this.refs.modal.reset())
 //   console.log(this)
  },
   handleclean() {
    //this.refs.modal.open()
    //console.log(this.refs.modal.getDOMNode())
    // console.log(this.refs.modal.reset()
    this.refs.modal.close()
  },
  delete(){
  //  console.log('select_all',this.state.select_all)
    OPEN.volumes_data(this,this.state.select_all)
  },
  componentDidMount(){
    let table_trlengt=ReactDOM.findDOMNode(this.refs.volumes_table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totallength=ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].childNodes.length
    let tdheight=ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].scrollHeight
    let height_table=(totallength)*tdheight
    let totalwidth=(ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[0].clientWidth-17)/table_trlengt
  //   console.log(',,,11',table_trlengt,totallength)
    let totalHeight = document.body.clientHeight
    //let totalwidth=1053.36-21.18
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let volumes_nav = ReactDOM.findDOMNode(this.refs.volumes_nav).clientHeight
    let volumes_bu = ReactDOM.findDOMNode(this.refs.volumes_bu).clientHeight
    totalHeight = totalHeight - volumes_nav - volumes_bu - 120
    //ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    //ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.width=totalwidth+'px'
    if (totalHeight>height_table){
      ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    }else{
    ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    for (let i in ReactDOM.findDOMNode( this.refs.volumes_table).childNodes[1].childNodes[0].childNodes[0].childNodes){
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
