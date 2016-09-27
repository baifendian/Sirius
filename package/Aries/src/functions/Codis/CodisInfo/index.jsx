import React from 'react'
import ReactDOM from 'react-dom'
import xhr from 'bfd-ui/lib/xhr'
import Button from 'bfd-ui/lib/Button'
import DataTable from 'bfd-ui/lib/DataTable'
import SearchInput from 'bfd-ui/lib/SearchInput'

import DynamicTable from 'public/DynamicTable'
import CodisConf from '../Conf/CodisConf'
import Toolkit from 'public/Toolkit/index.js'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import { SplitPanel, SubSplitPanel } from 'bfd-ui/lib/SplitPanel'

import CMDR from '../CodisCloudDataRequester/requester.js'
import './index.less'
import ObjectRow from './ObjectRow'
import ObjectProxy from './ObjectProxy'
import ObjectPic from './ObjectPic'
import ObjectLog from './ObjectLog'
import message from 'bfd-ui/lib/message'
import Editable from 'bfd-ui/lib/Editable'
import NavigationInPage from 'public/NavigationInPage'


export default React.createClass({
  getInitialState: function () {
    
    this.oriData = []
    let state_dict = {
      // 表格信息
      column: [{ title:'codis_id',        key:'codis_id',	        order:true },
               { title:'product_id',	     key:'product_id',	    order:true },
               { title:'addr',	                key:'dashboard',	            order:true },
               { title:'proxy_addr', key:'dashboard_proxy_addr', order:true ,
               render: (text, item) => {
          if(this.state.is_super==1){
            return  (<a href="javascript:void(0);" >
                <Editable onChange={value=>{this.handleEdit(item.product_id,value)}} defaultValue={text} />
              </a>
            )
          }else{
            return <div>{text}</div>
          }
        }},
               { title:'Mem_used/Mem_total',	key:'memory_used_to_total',      order:true }],
      showPage:'false',
      data:{"totalList": [],"totalPageNum":0},

      // 详情信息
      detailText: '',
      value:'',
      p_id:'',
      product_id:'',
      mem:'',
      is_super:0
    }
    return state_dict
  },


  componentDidMount(){
    this.checkToRequestData()
    this.calcDesiredHeight()
    window.onresize = ()=>{ this.onWindowResize() }
  },

  componentDidUpdate(){
    this.checkToRequestData()
  },

  onWindowResize(){
    window.onresize = undefined
    this.calcDesiredHeight()
    window.onresize = ()=>{ this.onWindowResize() }
  },

  calcRootDivHeight(){
    let totalHeight = document.body.clientHeight
    totalHeight -= document.getElementById('header').clientHeight
    totalHeight -= document.getElementById('footer').clientHeight
    totalHeight -= 20*2               // 去掉设置的子页面padding
    return totalHeight
  },

  calcDesiredHeight(){
    let rootDivHeight = this.calcRootDivHeight()
    ReactDOM.findDOMNode(this.refs.RootDiv).style.height = (rootDivHeight+'px')

    let splitPanelHeight = rootDivHeight - 60

    let splitPanel = ReactDOM.findDOMNode( this.refs.SplitPanel )
    let topHeight = parseInt(splitPanelHeight/3) * 2
    let bottomHeight = splitPanelHeight - topHeight
    splitPanel.style.height = splitPanelHeight + 'px'
    splitPanel.childNodes[0].style.height = topHeight + 'px'
    splitPanel.childNodes[1].style.top = topHeight + 'px'
    splitPanel.childNodes[2].style.height = bottomHeight + 'px'

    this.onSplitPanelHeightChange( 0,0,topHeight,bottomHeight )
  },

  onTableHeadOrder(name, sort){
    let oriArr = this.state.filteredData !== undefined ? this.state.filteredData : this.props.dataTableDataArr

    // 从oriArr克隆一个数组出来（因为slice不会在原数组上进行操作，因此可以直接slice(0)来实现克隆）
    let sortedArr = oriArr.slice(0)

    sortedArr.sort( function(r1,r2){
      let comparedStr = Toolkit.calcValueSort( r1[name],r2[name],'asc','desc' )
      return comparedStr === sort ? -1 : 1
    } )
    this.setState({ filteredData:sortedArr })
  },

  hightlightNewClickedItemAndShowDetailInfo( record ){
    let detail = record['DetailInfo']
    let detailInfoToShow = []
    for ( let k = 0 ; k < detail.length ; k ++ ){
      detailInfoToShow.push( [detail[k]] )
    }
    this.setState({ detailText:detailInfoToShow })

    let curTr = this.findDataTableItemByRecordName( record['Name'] )
    this.highlightTr( curTr )
    this.curSelectDataTableItem = curTr
  },

  findDataTableItemByRecordName( name ){
    let dataTableNode = ReactDOM.findDOMNode( this.refs.DataTable )
    let tbody = dataTableNode.childNodes[1].childNodes[1]
    for ( let i = 0 ; i < tbody.childNodes.length ; i ++ ){
      let tr = tbody.childNodes[i]
      if ( tr.childNodes[0].innerHTML === name ){
        return tr
      }
    }
    return undefined
  },

	onSplitPanelHeightChange( oldTopHeight,oldBottomHeight,newTopHeight,newBottomHeight ){
    let dataTable = ReactDOM.findDOMNode( this.refs.DataTable )
    dataTable.childNodes[1].childNodes[1].style.height = (newTopHeight-65) + 'px'
  },

  xhrCallback:(_this,executedData) => {
    _this.setState ( {
      'data': {
        "totalList": executedData["codis_list"],
        "totalPageNum":executedData["codis_list"].length
      },
      'is_super':executedData["is_super"]
    })
    _this.oriData = executedData
  },

  checkToRequestData(){
        // 如果当前保存的namespace与实时获取的namespace相同，则不再重新请求
    // 否则，重新请求数据
    console.log("is_super:"+this.state.is_super);
    if ( this.curNameSpace !== CMDR.getCurNameSpace(this) ){
      CMDR.getCodisList( this,this.xhrCallback )
      this.curNameSpace = CMDR.getCurNameSpace(this)
    }
    },

  handleEdit(product_id,new_addr) {
    console.log(product_id,new_addr);
    let url = `v1/codis/codis/?op=UPDATEPROXYADDR`;
    xhr({
        type: 'PUT',
        url: url,
        data:{"data":{"op":"UPDATEPROXYADDR","new_addr":new_addr,"name":product_id}},
        success(data) {
          message.success("proxy地址更新成功!", 2);
        }
        });
      },


  /**
   * 1：页面初始化时，该函数将不会被调用
   * 2：当用户输出为空时，传入的 value 为''
  */
  onSearchByKey( value ){
    let arr = []
    if ( !value ){
      arr = this.oriData
    }else{
      for ( let i = 0 ; i < this.oriData.length ; i ++ ){
        if (Toolkit.checkSubStrInStr( this.oriData[i]['product_id'],value )){
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

  selectColorByPercent(percent){
    if (percent <= 33.33){
      return '#1CB162'
    }else if (percent <= 66.66){
      return '#1BB8FA'
    }else {
      return '#FA7252'
    }
  },

clearOldHighlightItem(){
    this.highlightTr( this.curSelectDataTableItem,false )
    this.curSelectDataTableItem = undefined

    this.setState( {detailText:''} )
  },

 highlightTr( tr,highlight = true ){
    tr && ( tr.className = highlight ? 'selectedDataTableItem':'' )
  },

onTableRowClick( record ){
    this.state.p_id = record['product_id']
    this.state.codis_id = record['codis_id']
    this.clearOldHighlightItem()
    this.setState({ detailText:"" })
    CMDR.getProxyData(this.state.codis_id,( executedData ) => {
      let proxylist = executedData
      let proxyinfo = [];
      for (var i=0; i < proxylist.length; i++) {
         proxyinfo.push(<ObjectProxy proxy={proxylist[i]} issuper={this.state.is_super}/>);
      }
      this.setState ( {
        "proxyinfo": proxyinfo
      })
    });
    CMDR.getServerData(this.state.codis_id,( executedData ) => {
      let serverlist = executedData;
      let serverinfo = [];
      for (var j=0; j < serverlist.length; j++) {
         serverinfo.push(<ObjectRow  serverlist = {serverlist[j]}/>);
      }
      this.setState ( {
        "serverinfo": serverinfo
      })
    });
    CMDR.getPicData(this.state.codis_id,( executedData ) => {
      let piclist = executedData;
      let picinfo = (<ObjectPic piclist = {piclist}/>);
      this.setState ({
        "picinfo": picinfo
      })
    })
    CMDR.getLogData(this.state.p_id,( executedData ) => {
      let log = executedData;
      let loginfo = []
      for (var k=0; k < log.length; k++) {
          loginfo.push(<ObjectLog log = {log[k]} />)
      }
      this.setState ({
        "loginfo": loginfo
      })
    })
    let curTr = this.findDataTableItemByRecordName( record['product_id'] )
    this.highlightTr( curTr )
    this.curSelectDataTableItem = curTr
    let a = ReactDOM.findDOMNode( this.refs.textdiv )
    let b = ReactDOM.findDOMNode( this.refs.tablediv )
    a.className = "nonediv"
    b.className = "tablediv"
  },


  findDataTableItemByRecordName( name ){
    let dataTableNode = ReactDOM.findDOMNode( this.refs.DataTable )
    let tbody = dataTableNode.childNodes[1].childNodes[1]
    for ( let i = 0 ; i < tbody.childNodes.length ; i ++ ){
      let tr = tbody.childNodes[i]
      if ( tr.childNodes[1].innerHTML === name ){
        return tr
      }
    }
    return undefined
  },

 handleChange: function(event) {
     this.setState({value: event.target.value});
   },
 handleChange1: function(event) {
     this.setState({product_id: event.target.value});
   },
 handleChange2: function(event) {
     this.setState({mem: event.target.value});
   },

 handleSave() {
  let value = this.state.value;
  let product_id = this.state.p_id;
  let url = 'v1/codis/codis/'
  xhr({type: 'PUT',
       url: url,
       data:{"data":{"op":"alertmem","alertmem":value,"product_id":product_id}},
       success:data =>{
        message.success("扩容成功!", 2);
        this.curNameSpace = undefined;
        this.checkToRequestData();
      }
    });
   this.refs.addmem.close()
 },

handleSave_a() {
  let name = this.state.product_id;
  let mem = this.state.mem;
  let url = `v1/codis/codis/`;
  xhr({type: 'POST',
      url: url,
      data:{"name":name,"mem":mem},
      success:data =>{
        message.success("添加成功!", 2);
        this.modalClose();
        this.curNameSpace = undefined;
        this.checkToRequestData();
      }
    });
this.refs.modal.close();
},

handleSave2() {
  let name = this.state.p_id;
  let url = `v1/codis/codis/`;
  xhr({type: 'PUT',
       url: url,
       data:{"data":{"op":"addproxy","product_id":name}},
       success:data =>{
        message.success("添加proxy请求已下发!", 2);
        this.modalClose();
        this.curNameSpace = undefined;
        this.checkToRequestData();
      }
    });
 this.refs.addproxy.close();
},

handleSave3() {
  let name = this.state.p_id;
  let url = `v1/codis/codis/`;
  xhr({type: 'DELETE',
       url: url,
       data:{"data":{"product_id":name}},
       success:data =>{
        message.success("删除成功!", 2);
        this.modalClose();
        this.curNameSpace = undefined;
        this.checkToRequestData();
      }
    });
 this.refs.deletecodis.close();
},

  handleOpen() {
    this.refs.modal.open()
  },
  addmem() {
    let t_f = this.is_choose_codis()
    if (!t_f){this.refs.alert.open()
      }else{
    this.refs.addmem.open()}
  },

  is_choose_codis(){
    console.log(this.state.p_id)
    if(this.state.p_id == ""){
      console.log(this.state.p_id)
      return false
    }
    return true
  },

  addmemclose() {
    this.refs.addmem.close()
  },

modalClose(){
  this.refs.modal.close()
},

addproxyclose(){
  this.refs.addproxy.close()
},

addproxy() {
  let t_f = this.is_choose_codis()
  if (!t_f){this.refs.alert.open()
  }else{
  this.refs.addproxy.open()}
},
deletecodis() {
  let t_f = this.is_choose_codis()
  if (!t_f){this.refs.alert.open()
  }else{
  this.refs.deletecodis.open()}
},
deletecodisclose() {
  this.refs.deletecodis.close()
},
autorebalanceclose(){
  this.refs.autorebalance.close()
},

alertclose(){
  this.refs.alert.close()
},

autorebalance(){
  let t_f = this.is_choose_codis()
  if (!t_f){this.refs.alert.open()
  }else{
  this.refs.autorebalance.open()}
},

handleSave4() {
  let name = this.state.product_id;
  let url = `v1/codis/rebalance/`;
  xhr({type: 'POST',
       url: url,
       data:{"product_id":name},
       success:data =>{
        message.success("负载均衡请求下发成功!", 2);
        this.refs.autorebalance.close()
        this.curNameSpace = undefined;
        this.forceUpdate();
      }
    });
    this.refs.autorebalance.close()
  },

  formatPercent(used,total){
    return (total == 0) ? 100 : parseInt( 100 * used / total)
  },
  requestArgs:{
    pageName : "CodisInfo",
  },

  render: function() {
    let spaceName = CodisConf.getCurSpace(this);
    let proxyinfo = this.state.proxyinfo;
    let serverinfo = this.state.serverinfo;
    let picinfo = this.state.picinfo;
    let loginfo = this.state.loginfo;
    let headText = 'codis列表'
    let value = this.state.value
    let product_id = this.state.product_id
    let mem = this.state.mem
    let naviTexts = [{  'url':'/',   'text':'首页'   },
                     {  'url':'/Codis/CodisInfo',     'text':'codis信息'   },
                     {  'url':'/Codis/CodisInfo',  'text':'codis列表'   }]
    let text = this.state.detailText
    let result = [{user:300,sales:100,date:"2016-1-1"},{user:200,sales:300,date:"2016-1-2"},{user:100,sales:200,date:"2016-1-3"},{user:200,sales:300,date:"2016-1-4"},{user:200,sales:300,date:"2016-1-5"}]
    let result1 = [{value:18954,name:"expires"},{value:1555,name:"unexpires"}]
    if ( !text ){
      text = [['请选择Service']]
    }
    return  (
      <div className="CodisInfoChildRootDiv" ref="RootDiv">
        <NavigationInPage headText={CodisConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={CodisConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
        <div className="ButtonFatherDiv">
          <div className="SearchInputFatherDiv">
            <SearchInput  placeholder="请输入查询关键字"
                       onChange={function(){}}
                       onSearch={this.onSearchByKey}
                       label="查询" />
          </div>
          {this.state.is_super==1?
           <div> 
             <button type="button" className=" ButtonDiv btn btn-primary" onClick={this.handleOpen}>新增</button>           
             <button type="button" className="ButtonDiv btn btn-primary" onClick={this.addmem}>扩容</button>
             <button type="button" className="ButtonDiv btn btn-primary" onClick={this.addproxy}>添加proxy</button>
             <button type="button" className="ButtonDiv btn btn-primary" onClick={this.deletecodis}>删除codis</button>
             <button type="button" className="ButtonDiv btn btn-primary" onClick={this.autorebalance}>Auto Rebalance</button> 
           </div>  
           : null}
          <Modal ref="modal">
            <ModalHeader>
              <h4>创建codis集群</h4>
            </ModalHeader>
            <ModalBody>
            <div className="function-Codis-modelDiv">
            <table>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>product_id</td>
                        <td style={{width:10}}>  </td>
                        <td><input type='text' product_id={product_id} onChange={this.handleChange1} /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>申请空间大小</td>
                        <td style={{width:10}}></td>
                        <td><input type='text' mem={mem} onChange={this.handleChange2} /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                </table>
            </div>
            <div className="function-UserAuth-Button-Div">
               <Button className="left-Button" onClick={this.handleSave_a}>保存</Button>
               <Button type="primary" onClick={this.modalClose}>取消</Button>
            </div>
            </ModalBody>
          </Modal>
          <Modal ref="alert">
            <ModalHeader>
              <h4>提示</h4>
            </ModalHeader>
            <ModalBody>
            <div className="function-Codis-modelDiv">
               <table>
                  <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:270,textAlign:"end"}}>请选择一个codis集群进行操作</td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                </table>
            </div>
            <div className="function-UserAuth-Button-Div">
               <Button className="left-Button1" type="primary" onClick={this.alertclose}>确认</Button>
            </div>
            </ModalBody>
          </Modal>
          <Modal ref="addmem">
            <ModalHeader>
              <h4>codis集群扩容</h4>
            </ModalHeader>
            <ModalBody>
            <div className="function-Codis-modelDiv">
                <table>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>为集群<strong> {this.state.p_id} </strong> 扩容</td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:150,textAlign:"end"}}>扩容大小(10的整数倍)</td>
                        <td style={{width:10}}></td>
                        <td><input type='text' value={value} onChange={this.handleChange} /></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                </table>
         
            </div>
            <div className="function-UserAuth-Button-Div">
               <Button className="left-Button" onClick={this.handleSave}>保存</Button>
               <Button type="primary" onClick={this.addmemclose}>取消</Button>
            </div>
            </ModalBody>
          </Modal>
          <Modal ref="addproxy">
            <ModalHeader>
              <h4>添加proxy</h4>
            </ModalHeader>
            <ModalBody>
            <div className="function-Codis-modelDiv">
                <table>
                  <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:300,textAlign:"end"}}>确定为codis集群:<strong> {this.state.p_id} </strong> 添加proxy？</td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                </table>

            </div>
            <div className="function-UserAuth-Button-Div">
               <Button className="left-Button" onClick={this.handleSave2}>确认</Button>
               <Button type="primary" onClick={this.addproxyclose}>取消</Button>
            </div>
            </ModalBody>
          </Modal>
          <Modal ref="deletecodis">
            <ModalHeader>
              <h4>删除codis</h4>
            </ModalHeader>
            <ModalBody>
            <div className="function-Codis-modelDiv">
               <table>
                  <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:270,textAlign:"end"}}>确定删除codis集群:<strong> {this.state.p_id} </strong>？</td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                </table>
            </div>
            <div className="function-UserAuth-Button-Div">
               <Button className="left-Button" onClick={this.handleSave3}>确认</Button>
               <Button type="primary" onClick={this.deletecodisclose}>取消</Button>
            </div>
            </ModalBody>
          </Modal>
          <Modal ref="autorebalance">
            <ModalHeader>
              <h4>Auto Rebalance</h4>
            </ModalHeader>
            <ModalBody>
            <div className="function-Codis-modelDiv">
            <table>
                  <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                    <tr>
                        <td></td>
                        <td style={{width:270,textAlign:"end"}}>确定为codis集群:<strong> {this.state.p_id} </strong>负载均衡？</td>
                    </tr>
                    <tr>
                        <td colSpan="5" style={{height:20}}></td>
                    </tr>
                </table>
            </div>
            <div className="function-UserAuth-Button-Div">
               <Button className="left-Button" onClick={this.handleSave4}>确认</Button>
               <Button type="primary" onClick={this.autorebalanceclose}>取消</Button>
            </div>
            </ModalBody>
          </Modal>
        </div>
        <div>
          <SplitPanel ref='SplitPanel'
                    onSplit={this.onSplitPanelHeightChange}
                    className='SplitPanel'
                    direct="hor">
              <SubSplitPanel>
                <div className="DataTableFatherDiv">
                    <DataTable ref="DataTable" data={this.state.data}
                                 showPage={this.state.showPage}
                                 onRowClick={this.onTableRowClick}
                                 column= { this.state.column } />
                </div>
              </SubSplitPanel>
              <SubSplitPanel>
                <div className="Text">详情</div>
                <div ref="textdiv" className="blockdiv">
                    <DynamicTable ref='DynamicTable' dynamicTableTextArray={text}/>
                </div>
                <div ref="tablediv" className="nonediv">
                    <Tabs>
                      <TabList>
                          <Tab>Overview</Tab>
                          <Tab>Server Groups</Tab>
                          <Tab>Proxy Status</Tab>
                          <Tab>Log Info</Tab>
                      </TabList>
                      <TabPanel>
                      {picinfo}
                      </TabPanel>
                      <TabPanel>
                      {serverinfo}
                      </TabPanel>
                      <TabPanel>
                          <h3> <b>Proxy Status</b> </h3>
                      {proxyinfo}
                      </TabPanel>
                      <TabPanel>
                          <div className="logdiv">
                            {loginfo}
                          </div>
                      </TabPanel>
                      </Tabs>
                </div>
              </SubSplitPanel>
          </SplitPanel>
        </div>
      </div>
    )
  }
});
