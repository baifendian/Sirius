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
import '../PublicStyle/style.less'


export default React.createClass({
  getInitialState: function () {
    this.oriData = []
    let state_dict = {
      // 表格信息
      column: [{ title:'Name',          key:'Name',	        order:true }, 
               { title:'Ready',         key:'Ready',	      order:true }, 
               { title:'Status',        key:'Status',	      order:true },                
               { title:'Restarts',      key:'Restarts',	    order:true }, 
               { title:'CreationTime',  key:'CreationTime',	order:true }, 
               { title:'Node',          key:'Node',         order:true }],
      showPage:'false',
      data:{"totalList": [],"totalPageNum":0},
      
      // 详情信息
      detailText: ''
    }
    return state_dict
  },

  componentDidUpdate(){
    this.checkToRequestData()
  },

  componentDidMount(){
    this.checkToRequestData()
    this.initSetSplitPanelHeight()
  },

  initSetSplitPanelHeight(){
    let splitPanel = ReactDOM.findDOMNode( this.refs.SplitPanel )
    let topHeight = splitPanel.childNodes[0].style.height
    let bottomHeight = splitPanel.childNodes[2].style.height
    topHeight = parseInt( topHeight )
    bottomHeight = parseInt( bottomHeight )

    let off = parseInt( topHeight/3 )
    splitPanel.childNodes[0].style.height = (topHeight+off) + 'px'
    splitPanel.childNodes[1].style.top = (topHeight+off) + 'px'
    splitPanel.childNodes[2].style.height = (bottomHeight-off) + 'px'
    this.onSplitPanelHeightChange( 0,0,topHeight+off,bottomHeight-off )
  },

  checkToRequestData(){
    // 如果当前保存的namespace与实时获取的namespace相同，则不再重新请求
    // 否则，重新请求数据
    if ( this.curNameSpace !== CMDR.getCurNameSpace(this) ){
      CMDR.getPodList( this,this.xhrCallback )
      this.curNameSpace = CMDR.getCurNameSpace(this)
    }
  },

  xhrCallback:(_this,executedData) => {
    _this.oriData = executedData
    _this.resetPropData( executedData,_this )
  },  

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
    this.resetPropData( arr )
  },

  resetPropData( dataArr,_this = undefined ){
    _this = _this || this
    _this.setState ( { 
      'data': {
        'totalList': dataArr,
        'totalPageNum': dataArr.length
      }
    })

    _this.clearOldHighlightItem()
  },

  onTableRowClick( record ){
    this.clearOldHighlightItem()
    this.hightlightNewClickedItem( record )
  },

  clearOldHighlightItem(){
    this.highlightTr( this.curSelectDataTableItem,false )
    this.curSelectDataTableItem = undefined

    this.setState( {'detailText':''} )
  },

  hightlightNewClickedItem( record ){
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

  highlightTr( tr,highlight = true ){
    tr && ( tr.className = highlight ? 'selectedDataTableItem':'' )
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

    let dynamicTable = ReactDOM.findDOMNode( this.refs.DynamicTable )
    dynamicTable.style.height = (newBottomHeight-47) + 'px'
  },

  render: function() {
	  let headText = '我的集群'
	  let naviTexts = [{  'url':'/',   'text':'首页'   },
	                   {  'url':'/CalcManage/Overview',	'text':'计算管理'  },
                     {  'url':'/CalcManage/PodInfo',  'text':'Pod信息'   }]
    let text = this.state.detailText ? this.state.detailText : [['请选择Pod']]

    return (      
      <div className="PodInfoChildRootDiv" >
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

