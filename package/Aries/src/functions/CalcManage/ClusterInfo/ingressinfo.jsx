import React from 'react'

import Button from 'bfd/Button'

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
      this.curNameSpace = curNameSpace
      CMDR.getIngressList( curNameSpace,( executedData )=>{

        /**       
        // 此处代码仅用于测试
        let executedData = [{
          'Name':'Name1',
          'Ingress':['ip1','ip2','ip3'],
          'Rules':[{'Url':'url1','ServiceName':'ServiceName1'}],
          'DetailInfo':['DetailInfo1']
        },{
          'Name':'Name2',
          'Ingress':['ip21','ip22','ip23'],
          'Rules':[{'Url':'url2','ServiceName':'ServiceName2'}],
          'DetailInfo':['DetailInfo12']
        }]
        */

        this.setState ({ 'dataTableDataArr':executedData })
      } )
    }
  },

  // 当namespace切换的时候，将会强制调用这个render函数
  render: function() {
    let dataTableConfigDict = {
	    // 表格信息
      column:  [{ 
        title:'Name',
        key:'Name',
        order:true 
      },{ 
        title:'Ingress', 
        key:'Ingress',
        order:true,
        render:(ipList,item)=>{
          return (
            <table className="InnerTable">
              <tbody>
                {ipList.map( (ip)=>{
                  return <tr><td>{ip}</td></tr>} 
                )}
              </tbody>
            </table>
          )
        }
      },{ 
        title:'Rules',
        key:'Rules',
        order:true,
        render:(ruleDataList,item) => {
          return (
            <table className="InnerTable">
              <tbody>
                {ruleDataList.map( (ruleInfo)=>{
                  return (
                    <tr>
                      <td>{ruleInfo['Url']}</td>
                      <td>{ruleInfo['ServiceName']}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        }
      },{
        title:'CreationTime', 
        key:'CreationTime',
        order:true
      },{
        title:'Json',
        key:'',
        render:(varNotUse,item) => {
          let downloadUrl = CMDR.getIngressJsonDownloadUrl( CMDR.getCurNameSpace(this),item['Name'] )
          let aLabelID = 'ALabel'+item['Name']
          return (
            <div>
              <Button size='sm' onClick={()=>{ document.getElementById(aLabelID).click() }}>下载</Button> 
              <a id={aLabelID} href={downloadUrl} style={{'display':'none'}}></a>
            </div>
          )
        },
        order:false,
      }],
      showPage:'false'
    }
    let navigationKey = 'IngressInfo'
    let spaceName = CalcManageConf.getCurSpace(this);
    let rootDivClassName = 'IngressInfoChildRootDiv'
    let defaultDetailText = [['请选择Ingress']]

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

