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
      searchInputKey:'',
      filteredData:undefined,
      detailText:''
    }
    return state_dict
  },

  componentDidMount(){
    this.calcDesiredHeight()
    window.onresize = ()=>{ this.onWindowResize() }
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

    let splitPanelHeight = rootDivHeight - ReactDOM.findDOMNode(this.refs.NavigationInPage).clientHeight

    let splitPanel = ReactDOM.findDOMNode( this.refs.SplitPanel )
    let topHeight = parseInt(splitPanelHeight/3) * 2
    let bottomHeight = splitPanelHeight - topHeight
    splitPanel.style.height = splitPanelHeight + 'px'
    splitPanel.childNodes[0].style.height = topHeight + 'px'
    splitPanel.childNodes[1].style.top = topHeight + 'px'
    splitPanel.childNodes[2].style.height = bottomHeight + 'px'

    this.onSplitPanelHeightChange( 0,0,topHeight,bottomHeight )
  },

  onSearchByKey( value ){
    if ( !value ){
      this.setState({ 
        searchInputKey: value,
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
        searchInputKey: value,
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
    this.storeVarData = {
      dataTableDataArr:this.props.dataTableDataArr
    }
  },

  render: function (){
    let naviTexts = this.storeConstData.naviTexts
    if ( this.storeVarData.dataTableDataArr !== this.props.dataTableDataArr ){      
      // 如果namespace发生切换，则会进入这个函数体内
      this.storeVarData.dataTableDataArr = this.props.dataTableDataArr

      this.state.detailText = ''
      this.state.filteredData = undefined
      this.state.searchInputKey = ''

      // 如果namespace发生切换，则说明url后缀的cur_space的值发生了改变，因此需要动态调整NavigationInPage的链接
      naviTexts = []
      for ( let i = 0 ; i < this.storeConstData.naviTexts.length ; i ++ ){
        naviTexts.push( {
          url:this.storeConstData.naviTexts[i].url + location.search,
          text:this.storeConstData.naviTexts[i].text
        } )
      }
    }

    let text = this.state.detailText ? this.state.detailText : this.storeConstData.defaultDetailText
    
    let d = this.state.filteredData!==undefined ? this.state.filteredData : this.storeVarData.dataTableDataArr
    let data = {
      totalList: d,
      totalPageNum:d.length
    }

    return (      
      <div ref="RootDiv" className={this.storeConstData.rootDivClassName} >
        <div className="SearchInputFatherDiv">
          <SearchInput key={Toolkit.generateGUID()}
                        ref="SearchInput"
                        placeholder="请输入查询关键字" 
                        onChange={function(){}} 
                        onSearch={this.onSearchByKey}
                        defaultValue={this.state.searchInputKey}
                        label="查询" />
        </div>
        <NavigationInPage ref="NavigationInPage" headText={this.storeConstData.headText} naviTexts={naviTexts} />
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



