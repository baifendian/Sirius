import React from 'react'
import ReactDOM from 'react-dom'

import DataTable from 'bfd-ui/lib/DataTable'
import SearchInput from 'bfd-ui/lib/SearchInput'
import { SplitPanel, SubSplitPanel } from 'bfd-ui/lib/SplitPanel'

import DynamicTable from 'public/DynamicTable'
import NavigationInPage from 'public/NavigationInPage'
import Toolkit from 'public/Toolkit/index.js'
import { AutoLayoutDiv , layoutInfoGenerator } from 'public/AutoLayout'

import CalcManageConf from '../UrlConf'
import PodDetailElement from './poddetail'

import './index.less'

var ClusterCommonInfo = React.createClass({
  getInitialState: function () {
    this.userData = {}
    this.userData['SearchInputKey'] = Toolkit.generateGUID()
    this.userData['DetailElementKey'] = Toolkit.generateGUID()
    
    let state_dict = {
      searchInputKey:'',
      filteredData:undefined,
      selectedRecordDict:undefined,
      detailElementHeight:0,
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
      defaultDetailText:config.defaultDetailText,
    }
    this.storeVarData = {
      dataTableDataArr:this.props.dataTableDataArr
    }

    // 保存四个节点的ID，以方便传给AutoLayoutDiv来自动计算组件高度
    this.storeConstData['divIDs'] = {
      rootDivID:Toolkit.generateGUID(),
      searchInputFatherDivID:Toolkit.generateGUID(),
      navigationInPageID:Toolkit.generateGUID(),
      splitPanelID:Toolkit.generateGUID(),
    }
    this.storeConstData['autoLayoutInfos'] = [
      layoutInfoGenerator( this.storeConstData['divIDs']['rootDivID'],true ),
      layoutInfoGenerator( this.storeConstData['divIDs']['searchInputFatherDivID'],false,'Const_0' ),
      layoutInfoGenerator( this.storeConstData['divIDs']['navigationInPageID'],false,'Const' ),
      layoutInfoGenerator( this.storeConstData['divIDs']['splitPanelID'],false,'Var',( newHeight )=>{
        this.onHeightChanged( newHeight )
      } ),
    ]
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

    this.setState( {selectedRecordDict:undefined} )
  },

  hightlightNewClickedItemAndShowDetailInfo( record ){
    this.setState({ selectedRecordDict:record })
    
    let curTr = this.findDataTableItemByRecordName( record['Name'] )
    this.highlightTr( curTr )
    this.curSelectDataTableItem = curTr
  },

  highlightTr( tr,highlight = true ){
    tr && ( tr.className = highlight ? 'selectedDataTableItem':'' )
  },

  findDataTableItemByRecordName( name ){
    let dataTableNode = ReactDOM.findDOMNode( this.refs.DataTable )
    let tbody = dataTableNode.childNodes[0].childNodes[1]
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
    dataTable.childNodes[0].childNodes[1].style.height = (newTopHeight-65) + 'px'

    this.setDetailElementHeight( newBottomHeight-47 )
  },

  onHeightChanged( splitPanelHeight ){
    splitPanelHeight -= 10

    let splitPanel = ReactDOM.findDOMNode( this.refs.SplitPanel )
    let topHeight = parseInt(splitPanelHeight/3) * 2
    let bottomHeight = splitPanelHeight - topHeight
    splitPanel.style.height = splitPanelHeight + 'px'
    splitPanel.childNodes[0].style.height = topHeight + 'px'
    splitPanel.childNodes[1].style.top = topHeight + 'px'
    splitPanel.childNodes[2].style.height = bottomHeight + 'px'

    this.onSplitPanelHeightChange( 0,0,topHeight,bottomHeight )
  },

  // 将 this.state.filteredData 转换成DataTable可用的结构
  getFilteredTableElements(){
    let d = this.state.filteredData!==undefined ? this.state.filteredData : this.storeVarData.dataTableDataArr
    let data = {
      totalList: d,
      totalPageNum:d.length
    }
    return data
  },

  // 由于Pod页面和非Pod页面的页面内容不同，因此这里专门添加一个函数用以区分
  checkIsPodPage(){
    return this.props.navigationKey === 'PodInfo'
  },

  // 在这里区分是pod的detail还是其他的detail
  setDetailElementHeight( elementHeight ){
    this.setState({ detailElementHeight:elementHeight })

    /** 
    if ( this.checkIsPodPage() ){
      this.refs.PodDetailElement.onElementHeightChanged( elementHeight )
    } else {      
      //ReactDOM.findDOMNode( this.refs.DynamicTable ).style.height =  + 'px'
    }*/
  },

  // 设置Pod或者非Pod的内容
  getDetailElementContent(){
    if ( this.checkIsPodPage() ){
      return this.state.selectedRecordDict
    } else {
      if ( this.state.selectedRecordDict ){
        let detail = this.state.selectedRecordDict['DetailInfoStrList']
        let detailInfoToShow = []
        for ( let k = 0 ; k < detail.length ; k ++ ){
          detailInfoToShow.push( [detail[k]] )
        }
        return detailInfoToShow
      } else {
        return this.storeConstData.defaultDetailText
      }
    }
  },

  render: function (){
    if ( this.storeVarData.dataTableDataArr !== this.props.dataTableDataArr ){      
      // 如果namespace发生切换，则会进入这个函数体内
      this.storeVarData.dataTableDataArr = this.props.dataTableDataArr

      this.state.selectedRecordDict = undefined
      this.state.filteredData = undefined
      this.state.searchInputKey = ''
    }

    return (
      <div id={this.storeConstData['divIDs']['rootDivID']} ref="RootDiv" className={this.storeConstData.rootDivClassName} >
        <div id={this.storeConstData['divIDs']['searchInputFatherDivID']}  className="SearchInputFatherDiv">
          <SearchInput key={this.userData['SearchInputKey']}
                        ref="SearchInput"
                        placeholder="请输入查询关键字" 
                        onChange={function(){}} 
                        onSearch={this.onSearchByKey}
                        defaultValue={this.state.searchInputKey}
                        label="查询" />
        </div>
        <div id={this.storeConstData['divIDs']['navigationInPageID']}>
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
        </div>
        <div id={this.storeConstData['divIDs']['splitPanelID']}>
          <SplitPanel ref='SplitPanel'
                      onSplit={this.onSplitPanelHeightChange} 
                      className='SplitPanel' 
                      direct="hor">
            <SubSplitPanel>
              <div className="DataTableFatherDiv">
                <DataTable className="DataTable" ref="DataTable" 
                          data={this.getFilteredTableElements()} 
                          onRowClick={this.onTableRowClick}
                          onOrder={this.onTableHeadOrder}
                          showPage={this.storeConstData.dataTableConfigDict.showPage} 
                          column={this.storeConstData.dataTableConfigDict.column } />
              </div>
            </SubSplitPanel>
            {this.checkIsPodPage() ? [
              <SubSplitPanel key={this.userData['DetailElementKey']}>
                <PodDetailElement ref='PodDetailElement'
                      podDetailHeight={this.state.detailElementHeight}
                      podDetailInfoDict={this.getDetailElementContent()} />
              </SubSplitPanel>
            ]:[
              <SubSplitPanel key={this.userData['DetailElementKey']}>
                <div className="Text">详情</div>
                <DynamicTable ref='DynamicTable' 
                      dynamicTableHeight={this.state.detailElementHeight}
                      dynamicTableTextArray={this.getDetailElementContent()}/>
              </SubSplitPanel>  
            ]}
          </SplitPanel>
        </div>
        <AutoLayoutDiv layoutInfos={this.storeConstData['autoLayoutInfos']} />
      </div>
    ) 
  }
})

export default ClusterCommonInfo



