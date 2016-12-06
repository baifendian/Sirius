import React from 'react'

import Button from 'bfd/Button'

import Toolkit from 'public/Toolkit/index.js'

import ClusterCommonInfo from './index.jsx'
import CMDR from '../CalcManageDataRequester/requester.js'
import CalcManageConf from '../UrlConf'
import './index.less'

export default React.createClass({

  getInitialState: function () {
    return { 
      dataTableDataArr:[]
    }
  },

  checkToRequestData(){
    // 如果当前保存的namespace与实时获取的namespace相同，则不再重新请求
    // 否则，重新请求数据
    let curNameSpace = CMDR.getCurNameSpace(this)
    if ( this.curNameSpace !== curNameSpace ){
      CMDR.getPodList( curNameSpace,(executedData)=>{
        this.setState ({ 'dataTableDataArr':executedData })
      })
      this.curNameSpace = curNameSpace
    }
  },

  // 当namespace切换的时候，将会强制调用这个render函数
  render: function() {
    let dataTableConfigDict = {
	    // 表格信息
      column:  [{ title:'Name',          key:'Name',	        order:true }, 
                { title:'Status',        key:'Status',	      order:true },                
                { title:'Ready',         key:'Ready',	        order:true }, 
                { title:'PodIP',         key:'PodIP',	        order:true },                
                { title:'HostIP',        key:'HostIP',	      order:true },                
                { title:'Node',          key:'Node',          order:true },
                { title:'Restarts',      key:'Restarts',	    order:false }, 
                { title:'CreationTime',  key:'CreationTime',	order:false },
                { 
                  title:'Age',
                  key:'',
                  render:(varNotUse,item) => {
                    return Toolkit.calcAge( item['CreationTime'] )
                  },
                  order:false,
                },{
                  title:'',
                  key:'',
                  render:(varNotUse,item) => {
                    let downloadUrl = CMDR.getPodJsonDownloadUrl( CMDR.getCurNameSpace(this),item['Name'] )
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
    let navigationKey = 'PodInfo'
    let spaceName = CalcManageConf.getCurSpace(this);
    let rootDivClassName = 'PodInfoChildRootDiv'
    let defaultDetailText = [['请选择Pod']]

    this.checkToRequestData()

    return (
      <ClusterCommonInfo dataTableConfigDict={dataTableConfigDict}
                         rootDivClassName={rootDivClassName}
                         navigationKey={navigationKey}
                         spaceName={spaceName}
                         defaultDetailText={defaultDetailText}
                         dataTableDataArr={this.state.dataTableDataArr}  />
    ) 
  }
});

