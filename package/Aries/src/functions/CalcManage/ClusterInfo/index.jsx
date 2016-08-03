import React from 'react'
import ReactDOM from 'react-dom'

import DataTable from 'bfd-ui/lib/DataTable'
import SearchInput from 'bfd-ui/lib/SearchInput'
import { SplitPanel, SubSplitPanel } from 'bfd-ui/lib/SplitPanel'

import DynamicTable from 'public/DynamicTable'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'

import './index.less'

var ClusterCommonInfo = React.createClass({
  getInitialState: function () {

    let state_dict = {
      filteredData:undefined,
      detailText:''
    }
    return state_dict
  },

  componentDidMount(){
    this.initSetSplitPanelHeight()
  },

  // 默认情况下SplitPanel两块是平均分配的，这里对其进行调整，按照该2:1进行分配
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

  onSearchByKey( value ){
    if ( !value ){
      this.setState({ 
        filteredData: undefined
      })      
    }else{
      let arr = []
      let oriData = this.props.dataTableDataArr
      for ( let i = 0 ; i < oriData.length ; i ++ ){
        if (Toolkit.checkSubStrInStr( oriData[i]['Name'],value )){
          arr.push( oriData[i] )
        }
      }
      this.setState({ 
        filteredData: arr
      })
    }
    this.clearOldHighlightItem()
  },

  onTableRowClick( record ){
    this.clearOldHighlightItem()
    this.hightlightNewClickedItemAndShowDetailInfo( record )
  },

  clearOldHighlightItem(){
    this.highlightTr( this.curSelectDataTableItem,false )
    this.curSelectDataTableItem = undefined

    this.setState( {detailText:''} )
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

  // 该函数只会被调用一次
  // this.storeConstData中存储的数据可认为是不会变更的（即父组件使用setState进行修改时组件不会响应修改）
  componentWillMount(){
    let config = this.props
    this.storeConstData = {
      headText:'我的集群',
      dataTableConfigDict:config.dataTableConfigDict,
      rootDivClassName:config.rootDivClassName,
      naviTexts:config.naviTexts,
      defaultDetailText:config.defaultDetailText
    }
  },

  render: function (){
    let text = this.state.detailText ? this.state.detailText : this.storeConstData.defaultDetailText
    
    let d = this.state.filteredData===undefined ? this.props.dataTableDataArr : this.state.filteredData
    let data = {
      totalList: d,
      totalPageNum:d.length
    }

    return (      
      <div className={this.storeConstData.rootDivClassName} >
        <div className="SearchInputFatherDiv">
          <SearchInput placeholder="请输入查询关键字" 
                       onChange={function(){}} 
                       onSearch={this.onSearchByKey}
                       label="查询" />
        </div>
        <NavigationInPage headText={this.storeConstData.headText} naviTexts={this.storeConstData.naviTexts} />
        <SplitPanel ref='SplitPanel'
                    onSplit={this.onSplitPanelHeightChange} 
                    className='SplitPanel' 
                    direct="hor">
          <SubSplitPanel>
            <div className="DataTableFatherDiv">
              <DataTable ref="DataTable" data={data} 
                         onRowClick={this.onTableRowClick}
                         showPage={this.storeConstData.dataTableConfigDict.showPage} 
                         column={this.storeConstData.dataTableConfigDict.column } />
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
})

export default ClusterCommonInfo



