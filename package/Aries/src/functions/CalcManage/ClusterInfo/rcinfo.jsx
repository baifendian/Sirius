import React from 'react'

import Button from 'bfd/Button'

import ClusterCommonInfo from './index.jsx'
import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'
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
      CMDR.getRCList( curNameSpace,(executedData)=>{
        this.setState ({ 'dataTableDataArr':executedData })
      })
      this.curNameSpace = curNameSpace
    }
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
               { title:'Selector',	    key:'Selector',	    order:true },
               {
                 title:'',
                 key:'',
                 render:(varNotUse,item) => {
                   let downloadUrl = CMDR.getRCJsonDownloadUrl( CMDR.getCurNameSpace(this),item['Name'] )
                   let aLabelID = 'ALabel'+item['Name']
                   return (
                     <div>
                       <Button onClick={()=>{ document.getElementById(aLabelID).click() }}>下载Json</Button> 
                       <a id={aLabelID} href={downloadUrl} style={{'display':'none'}}></a>
                     </div>
                   )
                 },
                 order:false,
               }],
      showPage:'false'
    }
    let navigationKey = 'ReplicationControllerInfo'
    let spaceName = CalcManageConf.getCurSpace(this);
    let rootDivClassName = 'RCInfoChildRootDiv'
    let defaultDetailText = [['请选择ReplicationController']]

    this.checkToRequestData()

    return (
      <ClusterCommonInfo dataTableConfigDict={dataTableConfigDict}
                         rootDivClassName={rootDivClassName}
                         navigationKey={navigationKey}
                         spaceName={spaceName}
                         defaultDetailText={defaultDetailText}
                         dataTableDataArr={this.state.dataTableDataArr} />
    ) 
  }
});


