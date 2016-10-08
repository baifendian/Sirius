import React from 'react'
import ReactDOM from 'react-dom'

import FixedTable from 'bfd/FixedTable'
import SearchInput from 'bfd/SearchInput'
import { SplitPanel, SubSplitPanel } from 'bfd/SplitPanel'

import DynamicTable from 'public/DynamicTable'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'

import CalcManageConf from '../UrlConf'
import './index.less'

var ClusterCommonInfo = React.createClass({
  getInitialState: function () {    
    let state_dict = {
      recordsTableHeight:200,         // FixedTable组件的高度
      detailInfoTableHeight:100,      // FixedTable组件下面详情框的高度
      searchInputKey:'',
      filteredData:undefined,
      detailText:''
    }
    return state_dict
  },

  // 该函数只会被调用一次
  // this.storeConstData中存储的数据可认为是不会变更的（即父组件使用setState进行修改时组件不会响应修改）
  componentWillMount(){
    let config = this.props
    this.storeConstData = {
      dataTableConfigDict:config.dataTableConfigDict,
      rootDivClassName:config.rootDivClassName,
      defaultDetailText:config.defaultDetailText
    }
    this.storeVarData = {
      dataTableDataArr:this.props.dataTableDataArr
    }
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
    let tbody = dataTableNode.childNodes[0].childNodes[0].childNodes[1]
    for ( let i = 0 ; i < tbody.childNodes.length ; i ++ ){
      let tr = tbody.childNodes[i]
      if ( tr.childNodes[0].innerHTML === name ){        
        return tr
      }
    }
    return undefined
  },

	onSplitPanelHeightChange( oldTopHeight,oldBottomHeight,newTopHeight,newBottomHeight ){
    this.setState( { 
      'recordsTableHeight':newTopHeight-65,
      'detailInfoTableHeight':newBottomHeight-47 
    } )
  },

  render: function (){
    if ( this.storeVarData.dataTableDataArr !== this.props.dataTableDataArr ){      
      // 如果namespace发生切换，则会进入这个函数体内
      this.storeVarData.dataTableDataArr = this.props.dataTableDataArr

      this.state.detailText = ''
      this.state.filteredData = undefined
      this.state.searchInputKey = ''
    }

    let text = this.state.detailText ? this.state.detailText : this.storeConstData.defaultDetailText
    let dataList = this.state.filteredData!==undefined ? this.state.filteredData : this.storeVarData.dataTableDataArr

    return (      
      <div ref="RootDiv" className={this.storeConstData.rootDivClassName} >
        <div className="SearchInputFatherDiv">
          <SearchInput ref="SearchInput"
                        placeholder="请输入查询关键字" 
                        onChange={function(){}} 
                        onSearch={this.onSearchByKey}
                        defaultValue={this.state.searchInputKey}
                        label="查询" />
        </div>
        <NavigationInPage ref="NavigationInPage" 
                          headText={CalcManageConf.getNavigationData({
                            pageName:this.props.navigationKey,
                            type : 'headText'
                          })} 
                          naviTexts={CalcManageConf.getNavigationData({
                            pageName:this.props.navigationKey,
                            type:'navigationTexts',
                            spaceName:this.props.spaceName
                          })} />
        <SplitPanel ref='SplitPanel'
                    onSplit={this.onSplitPanelHeightChange} 
                    className='SplitPanel' 
                    direct="hor">
          <SubSplitPanel>
            <div className="DataTableFatherDiv">
              <FixedTable className="DataTable" ref="DataTable" 
                          height={this.state.recordsTableHeight}
                          data={dataList} 
                          onRowClick={this.onTableRowClick}
                          onOrder={this.onTableHeadOrder}
                          column={this.storeConstData.dataTableConfigDict.column } />
            </div>
          </SubSplitPanel>
          <SubSplitPanel>
            <div className="Text">详情</div>
            <DynamicTable style={{height:this.state.detailInfoTableHeight}} ref='DynamicTable' 
                          dynamicTableTextArray={text}/>
          </SubSplitPanel>
        </SplitPanel>
      </div>
    ) 
  }
})

export default ClusterCommonInfo



