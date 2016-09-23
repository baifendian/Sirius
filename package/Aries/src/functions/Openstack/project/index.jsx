import React from 'react'
import { Menu, Dropdown as Dropdown1 ,Icon } from 'antd'
import './index.less'
import Button from 'bfd-ui/lib/Button'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Spin } from 'antd'
import DataTable from 'bfd-ui/lib/DataTable'
import NavigationInPage from 'public/NavigationInPage'
import OPEN from '../data_request/request.js'
import ReactDOM from 'react-dom'
import Openstackconf from '../Conf/Openstackconf'


/*
export default React.createClass({
   getInitialState: function () {
    return {
      loading:false,
      //url: OPEN.UrlList()['project'],
      column: [{
        title: '名称',
        order: false,
        key: 'name'
      }, {
        title: '描述',
        key: 'desc',
        order: false
      }, {
        title: '项目ID',
        key: 'id',
        order: false
      }, {
        title: '域名',
        key: 'domain_name',
        order: false,
      //  width: "26.25%"
      }
      ],
      dataTableDataArr:''
    }
  },
  handleOpen(name) {
    console.log(this.state.images_list)
  },
  componentDidMount(){
    let table_trlengt=ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes.length
    let totalHeight = document.body.clientHeight
    let totallength=ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].childNodes.length
    let tdheight=ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].scrollHeight
    let height_table=(totallength)*tdheight
    let totalwidth=(ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].clientWidth-17)/table_trlengt
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let project_nav = ReactDOM.findDOMNode(this.refs.project_nav).clientHeight
    let project_bu = ReactDOM.findDOMNode(this.refs.project_bu).clientHeight
    totalHeight = totalHeight - project_nav - project_bu - 120
    if (totalHeight>height_table){
      ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[1].style.height=totalHeight+'px'
    }else{
    ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].style.width=totalwidth+'px'
    for (let i in ReactDOM.findDOMNode( this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes){
      if (i==(table_trlengt-1)){
        totalwidth=totalwidth+17
        ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width=totalwidth+'px'
      }else{
        ReactDOM.findDOMNode(this.refs.Table).childNodes[1].childNodes[0].childNodes[0].childNodes[i].style.width=totalwidth+'px'
      }
    }
  }
    
  },
  componentWillMount: function(){
    OPEN.Get_project(this,this.xhrCallback)
  },
  xhrCallback:(_this,executedData) => {
    _this.setState ( { 
      dataTableDataArr:executedData,
    })
    return '1'
  },
  requestArgs:{
    pageName : "project",
  },
  render() {
    let spaceName = Openstackconf.getCurSpace(this)
    return (
      <div className="function-data-moduleA">
      <NavigationInPage ref="project_nav" headText={Openstackconf.getNavigationDatap({pageName:this.requestArgs.pageName, type:"headText"})} naviTexts={Openstackconf.getNavigationDatap({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
      <Spin spinning={this.state.loading}>
      	<div ref="project_bu">
          <Button onClick={this.handleOpen.bind(this,5)} style={{margin:'0px 10px 0px 0px'}}>刷新</Button>
      	</div>
      		<div className="DataTableFatherDiv_project">
        	<DataTable
            data={this.state.dataTableDataArr}
		        showPage="false"
		        column={this.state.column}
		        howRow={10}
		        onOrder={this.handleOrder}
		        onCheckboxSelect={this.handleCheckboxSelect}  ref="Table">
		      </DataTable>
		      </div>
          </Spin>
      </div>
    )
  }
})

*/


import { Component } from 'react'
import FixedTable from 'bfd/FixedTable'

class FixedTableDemo extends Component {
  constructor(props) {
    super()
    this.state = {
      column: [{
        title: '名称',
        order: false,
        key: 'name'
      }, {
        title: '描述',
        key: 'desc',
        order: false
      }, {
        title: '项目ID',
        key: 'id',
        order: false
      }, {
        title: '域名',
        key: 'domain_name',
        order: false,
      //  width: "26.25%"
      }
      ],
      data: []
    }
  }


  render() {
    let spaceName = Openstackconf.getCurSpace(this)
   // console.log(this.state.data)
    return (
      <div>
        <NavigationInPage ref="project_nav" headText={Openstackconf.getNavigationDatap({pageName:'project', type:"headText"})} naviTexts={Openstackconf.getNavigationDatap({pageName:'project',type:"navigationTexts",spaceName:spaceName})} />
        <div ref="project_bu">
          <Button onClick={::this.Get_project} style={{margin:'0px 10px 0px 0px'}}>刷新</Button>
        </div>
        <div></div>
        <div className="DataTableFatherDiv_project">
          <FixedTable 
            height={40}
            data={this.state.data}
            column={this.state.column}
            onRowClick={::this.handleRowClick}
            onOrder={::this.handleOrder}
            onCheckboxSelect={::this.handleCheckboxSelect}
            ref="Table"
          />
        </div>
      </div>
    )
  }


  componentWillMount(){
    this.Get_project()
  }

  Get_project(){
    OPEN.Get_project(this,this.xhrCallback)
  }

  componentDidMount(){

    window.onresize=()=>{
      let totalHeight = document.body.clientHeight
      totalHeight -= document.getElementById('header').clientHeight
      totalHeight -= document.getElementById('footer').clientHeight
      let project_nav = ReactDOM.findDOMNode(this.refs.project_nav).clientHeight
      let project_bu = ReactDOM.findDOMNode(this.refs.project_bu).clientHeight
      totalHeight = totalHeight - project_nav - project_bu - 120
      ReactDOM.findDOMNode( this.refs.Table).childNodes[0].style.height=totalHeight+'px' 
    }
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    let project_nav = ReactDOM.findDOMNode(this.refs.project_nav).clientHeight
    let project_bu = ReactDOM.findDOMNode(this.refs.project_bu).clientHeight
    totalHeight = totalHeight - project_nav - project_bu - 120
    ReactDOM.findDOMNode( this.refs.Table).childNodes[0].style.height=totalHeight+'px'   
  }

  xhrCallback(_this,executedData){
   // console.log(executedData['totalList'][0])
    let data=executedData
  //  console.log(data)
    _this.setState ({ 
      data
    })
  }

  handleClick(item, event) {
    event = event ? event : window.event;
    event.stopPropagation();
   // console.log(item)
  }

  handleCheckboxSelect(selectedRows) {
   // console.log('rows:', selectedRows)
  }

  handleRowClick(row) {
   // console.log('rowclick', row)
  }

  handleOrder(name, sort) {
   // console.log(name, sort)
  }
}

export default FixedTableDemo