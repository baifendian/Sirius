import React from 'react'
import ReactDOM from 'react-dom'

import DataTable from 'bfd-ui/lib/DataTable'
import SearchInput from 'bfd-ui/lib/SearchInput'
import { SplitPanel, SubSplitPanel } from 'bfd-ui/lib/SplitPanel'

import DynamicTable from 'public/DynamicTable'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'

import CMDR from '../CalcManageDataRequester/requester.js'
import './index.less'


export default React.createClass({
  getInitialState: function () {
    this.oriData = []
    let state_dict = {
      // 表格信息
      column: [{ title:'Name',          key:'Name',	        order:true }, 
               { title:'ClusterIP',	    key:'ClusterIP',	  order:true }, 
               { title:'ExternalIP',	  key:'ExternalIP',	  order:true }, 
               { title:'Ports',         key:'Ports',	      order:true },
               { title:'CreationTime',	key:'CreationTime', order:true },
               { title:'Selector',	    key:'Selector',	    order:true }],
      showPage:'false',
      data:{"totalList": [],"totalPageNum":0},

      // 详情信息
      detailText: ''
    }
    return state_dict
  },
  xhrCallback:(_this,executedData) => {
    _this.setState ( { 
      'data': {
        "totalList": executedData,
        "totalPageNum":executedData.length
      }
    })
    _this.oriData = executedData
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
        if (Toolkit.checkSubStrInStr( this.oriData[i]['Name'],value )){
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

  checkToRequestData(){
    // 如果当前保存的namespace与实时获取的namespace相同，则不再重新请求
    // 否则，重新请求数据
    if ( this.curNameSpace !== CMDR.getCurNameSpace(this) ){
      CMDR.getPodList( this,this.xhrCallback )
      this.curNameSpace = CMDR.getCurNameSpace(this)
    }
  },

  componentDidMount(){
    this.checkToRequestData()
  },

  componentDidUpdate(){
    this.checkToRequestData()
  },

  calcSplitPanelHeight(){
    let splitPanel = ReactDOM.findDOMNode( this.refs.SplitPanel )
    let topHeight = splitPanel.childNodes[0].style.height
    let bottomHeight = splitPanel.childNodes[2].style.height
    topHeight = parseInt( topHeight )
    bottomHeight = parseInt( bottomHeight )
    return [topHeight,bottomHeight]
  },

	onSplitPanelHeightChange( oldTopHeight,oldBottomHeight,newTopHeight,newBottomHeight ){
    let dynamicTable = ReactDOM.findDOMNode( this.refs.DynamicTable )
    dynamicTable.style.height = (newBottomHeight-41) + 'px'

    let dataTable = ReactDOM.findDOMNode( this.refs.DataTable )
    let tbodyHeight = newTopHeight-65
    dataTable.childNodes[1].childNodes[1].style.height = tbodyHeight + 'px'
  },
  
  onTableRowClick( record ){
    let detail = record['DetailInfo']
    let detailInfoToShow = []
    for ( let k = 0 ; k < detail.length ; k ++ ){
      detailInfoToShow.push( [detail[k]] )
    }
    this.setState({ detailText:detailInfoToShow })
  },

  render: function() {
    let headText = '我的服务'
    let naviTexts = [{  'url':'/',   'text':'首页'   },
                     {  'url':'/CalcManage/Overview',     'text':'计算管理'   },
                     {  'url':'/CalcManage/ServiceInfo',  'text':'Service信息'   }]
    let text = this.state.detailText
    if ( !text ){
      text = [['请选择Service']]
    }
    return  (
      <div className="ServiceInfoChildRootDiv">
        <div className="SearchInputFatherDiv">
          <SearchInput placeholder="请输入查询关键字" 
                       onChange={function(){}} 
                       onSearch={this.onSearchByKey}
                       label="查询" />
        </div>
        <NavigationInPage headText={headText} naviTexts={naviTexts} />
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
            <DynamicTable ref='DynamicTable' dynamicTableTextArray={text}/>
          </SubSplitPanel>
        </SplitPanel>
      </div>
    )
  }
});

