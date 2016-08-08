import React from 'react'

import ClusterCommonInfo from './index.jsx'
import CMDR from '../CalcManageDataRequester/requester.js'

import './index.less'

export default React.createClass({
  
  getInitialState: function () {
    return { dataTableDataArr:[] }
  },

  checkToRequestData(){
    // 如果当前保存的namespace与实时获取的namespace相同，则不再重新请求
    // 否则，重新请求数据
    let curNameSpace = CMDR.getCurNameSpace(this)
    if ( this.curNameSpace !== curNameSpace ){
      CMDR.getRCList( this,this.xhrCallback,curNameSpace )
      this.curNameSpace = curNameSpace
    }
  },

  xhrCallback:(_this,executedData) => {
    _this.setState ( { dataTableDataArr:executedData })
  },

  // 当namespace切换的时候，将会强制调用这个render函数
  render: function() {
    let dataTableConfigDict = {
        // 表格信息
      column: [{ title:'Name',          key:'Name',	        order:true }, 
               { title:'Desired',	      key:'Desired',	    order:true }, 
               { title:'Current',       key:'Current',	    order:true },      
               { title:'CreationTime',  key:'CreationTime',	order:true }, 
               { title:'Containers',    key:'Containers',	  order:true }, 
               { title:'Images',	      key:'Images',	      order:true }, 
               { title:'Selector',	    key:'Selector',	    order:true }],
      showPage:'false'
    }
    let rootDivClassName = 'RCInfoChildRootDiv'
    let naviTexts = [{  'url':'/',   'text':'首页'   },
                     {  'url':'/CalcManage/Overview',   'text':'计算管理'   },
                     {  'url':'/CalcManage/ReplicationControllerInfo',  'text':'RC信息'   }]
    let defaultDetailText = [['请选择ReplicationController']]

    this.checkToRequestData()

    return (
      <ClusterCommonInfo dataTableConfigDict={dataTableConfigDict}
                         rootDivClassName={rootDivClassName}
                         naviTexts={naviTexts}
                         defaultDetailText={defaultDetailText}
                         dataTableDataArr={this.state.dataTableDataArr} />
    ) 
  }
});


