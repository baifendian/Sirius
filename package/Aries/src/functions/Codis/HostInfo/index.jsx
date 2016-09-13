import React from 'react'
import ReactDOM from 'react-dom'
import Button from 'bfd-ui/lib/Button'
import DataTable from 'bfd-ui/lib/DataTable'
import SearchInput from 'bfd-ui/lib/SearchInput'
import { SplitPanel, SubSplitPanel } from 'bfd-ui/lib/SplitPanel'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import xhr from 'bfd-ui/lib/xhr'
import NavigationInPage from 'public/NavigationInPage'
import CodisConf from '../Conf/CodisConf'
import Toolkit from 'public/Toolkit/index.js'

import CMDR from '../CodisCloudDataRequester/requester.js'
import './index.less'
import message from 'bfd-ui/lib/message'

export default React.createClass({
  getInitialState: function () {
    this.oriData = []
    let state_dict = {
      // 表格信息
      column: [{ title:'ID',        key:'host_id',	        order:true },
               { title:'IP',         key:'host_ip',	      order:true },
               { title:'User',       key:'host_user',	      order:true },
               { title:'Mem_used',      key:'memort_used',	    order:true },
               { title:'Mem_total',  key:'memory_total',	order:true },
               { title:'Codis_home',   key:'codis_home',  order:true }],
      showPage:'false',
      is_super:0,
      data:{"totalList": [],"totalPageNum":0},
      formData: {},
      detailText:'',
      host_ip:'',
      host_user:'',
      password: '',
      memory: '',
      codis_home:''
    }
    return state_dict
  },

  handleChange1: function(event) {
      this.setState({host_ip: event.target.value});
    },

  handleChange2: function(event) {
      this.setState({host_user: event.target.value});
    },
  handleChange3: function(event) {
      this.setState({password: event.target.value});
    },
  handleChange4: function(event) {
      this.setState({memory: event.target.value});
    },
  handleChange5: function(event) {
      this.setState({codis_home: event.target.value});
    },

  onSearchByKey( value ){
    let arr = []
    if ( !value ){
      arr = this.oriData
    }else{
      for ( let i = 0 ; i < this.oriData.length ; i ++ ){
        if (Toolkit.checkSubStrInStr( this.oriData[i]['host_ip'],value )){
          arr.push( this.oriData[i] )
        }
      }
    }
    this.setState ( {
      "data": {
        "totalList": arr,
        "totalPageNum":arr.length
      }
    })
  },

  xhrCallback:(_this,executedData) => {
    _this.setState ( {
      'data': {
        "totalList": executedData["host_list"],
        "totalPageNum":executedData["host_list"].length
      },
      'is_super':executedData['is_super']
    })
    _this.oriData = executedData
  },

  saveMember(){
  let url = `v1/codis/hosts/`;
  let host_ip = this.state.host_ip
  let host_user = this.state.host_user
  let password = this.state.password
  let codis_home = this.state.codis_home
  let memory = this.state.memory
  xhr({type: 'POST',url: url,
      data:{"host_ip":host_ip,"host_user":host_user,"password":password,"codis_home":codis_home,"memory":memory},
    success:data =>{
      message.success("添加成功!", 2);
      this.modalClose();
      this.curNameSpace = undefined;
      this.checkToRequestData();
    }
    })
  },

  handleOpen() {
    this.refs.modal.open()
  },

  modalClose(){
    this.refs.modal.close()
  },

  componentDidMount(){
    this.checkToRequestData()
  },

  componentDidUpdate(){
    this.checkToRequestData()
  },


 is_super_button:{
    1:function(){return <button type="button" className="ButtonDiv btn btn-primary" onClick={this.handleOpen}>新增</button>},
    0:()=>{return <div style={{height: 35}}></div>}
  },

  checkToRequestData(){
    // 如果当前保存的namespace与实时获取的namespace相同，则不再重新请求
    // 否则，重新请求数据
    console.log("is_super:"+this.state.is_super);
    if ( this.curNameSpace !== CMDR.getCurNameSpace(this) ){
      CMDR.getHostList( this,this.xhrCallback )
      this.curNameSpace = CMDR.getCurNameSpace(this)
    }
  },
  requestArgs:{
    pageName : "HostInfo",
  },

  render: function() {
    let spaceName = CodisConf.getCurSpace(this);

	  let headText = '我的集群'
    let host_ip = this.state.host_ip
    let host_user = this.state.host_user
    let password = this.state.password
    let codis_home = this.state.codis_home
    let memory = this.state.memory
	  let naviTexts = [{  'url':'/',   'text':'首页'   },
	                   {  'url':'/CodisCloud/HostInfo',	'text':'Codis云'  },
                     {  'url':'/CodisCloud/HostInfo',  'text':'Host信息'   }]
    const { formData } = this.state

    return (
      <div className="HostInfoChildRootDiv" >
        <NavigationInPage headText={CodisConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={CodisConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
        <div className="ButtonFatherDiv">
            <div className="SearchInputFatherDiv">
              <SearchInput placeholder="请输入查询关键字"
                           onChange={function(){}}
                           onSearch={this.onSearchByKey}
                           label="查询" />
            </div>
            {this.is_super_button[this.state.is_super].call(this)}
        </div>
            <div className="DataTableFatherDiv">
              <DataTable ref="DataTable" data={this.state.data}
                         showPage={this.state.showPage}
                         onRowClick={this.onTableRowClick}
                         column= { this.state.column } />
            </div>
                          <Modal ref="modal">
                <ModalHeader>
                  <h4>添加host</h4>
                </ModalHeader>
              <ModalBody>
              <div className="function-Codis-HostList-modelDiv">
                <table>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>host_ip</td>
                        <td></td>
                        <td><input type='text' host_ip={host_ip} onChange={this.handleChange1} /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>host_user</td>
                        <td></td>
                        <td><input type='text' host_user={host_user} onChange={this.handleChange2} /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>password</td>
                        <td></td>
                        <td><input type='text' password={password} onChange={this.handleChange3} /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>memory</td>
                        <td></td>
                        <td><input type='text' memory={memory} onChange={this.handleChange4} /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td style={{width:60}}></td>
                        <td style={{width:150,textAlign:"end"}}>codis_home</td>
                        <td style={{width:20}}></td>
                        <td><input type='text' codis_home={codis_home} onChange={this.handleChange5} /></td>
                        <td></td>
                    </tr>
                </table>
              </div>
              <div className="function-UserAuth-Button-Div">
                 <Button className="left-Button" onClick={this.saveMember}>保存</Button>
                 <Button type="primary" onClick={this.modalClose}>取消</Button>
              </div>
              </ModalBody>
        </Modal>
      </div>
      
    )
  }
});
