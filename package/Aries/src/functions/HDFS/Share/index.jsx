import React from 'react'
import Task from 'public/Task'
import './index.less'
import DataTable from 'bfd-ui/lib/DataTable'
import confirm from 'bfd-ui/lib/confirm'
import Fetch from 'bfd-ui/lib/Fetch'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import Icon from 'bfd-ui/lib/Icon'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'
import HdfsConf from '../Conf/HdfsConf'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({
  confirm_handler(id,confirm_str,func,component){
    confirm(<TextOverflow><p style={{width: '250px'}}>{confirm_str}</p></TextOverflow>,()=>{
        func(id,component);
    });
  },
  handleSuccess(data){
    console.log(data);
    this.setState({data:data});
  },
  trash(id,component){
    let shareUrl = this.getUrlData({ type : "SHARE_DELETE",
                                     shareId : id
                                    });
    xhr({ type: 'DELETE',url:shareUrl,
        success: data =>{
          let dataTable = this.state.data;
          let totalList = this.state.data.totalList;
          let index = totalList.indexOf(component);
          totalList.splice(index,1);
          dataTable.totalList = totalList;
          this.setState({data:dataTable});
          message.success(data,2);
        }
    });

  },
  getInitialState: function() {
    return {
             totalNum:0,
             column:[{
              title:"id",
              key:"id",
             },{
              title:"分享路径",
              key:"proxy_path",
              render:(item, component)=> {
                return <TextOverflow>
                        <p style={{width: '100px'}}>{component.proxy_path}</p>
                      </TextOverflow>
              },
             },{
              title:"原路径",
              key:"source_path",
              render:(item, component)=> {
                return <TextOverflow>
                        <p style={{width: '100px'}}>{component.source_path}</p>
                      </TextOverflow>
              },
             },{
              title:"分享时间",
              key:"share_time",
             },{
              title: '分享人',
              key: 'share_user',
             },{
              title: '描述',
              key: 'desc',
             },{
              title: '操作',
              render:(item, component)=> {
                return <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.confirm_handler(item.id,`你确定要取消分享 ${item.id} 吗?`,this.trash,item)}}>
                        <img src={require('public/HDFS_Share/cancle_share_blue.png')} />
                       </a>
              },
              key: 'operation'
            }]
            };
  },
  requestArgs:{
    pageName : "Share",
    type : "",
    spaceName : "",
    shareId : ""
  },
  getUrlData({type="",spaceName="",shareId=""}){
    this.requestArgs.type = type;
    this.requestArgs.spaceName = spaceName;
    this.requestArgs.shareId = shareId;
    return HdfsConf.getUrlData(this.requestArgs);
  },
  render() {
    let spaceName = HdfsConf.getCurSpace(this);
    let shareUrl = this.getUrlData({ type : "SHARE_GET",
                                     spaceName : spaceName,
                                    });
    return (
        <div>
          <NavigationInPage headText={HdfsConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={HdfsConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
          <Fetch style={{minHeight:0}} url={shareUrl} onSuccess={this.handleSuccess}>
            <DataTable data={this.state.data} column={this.state.column}></DataTable>
          </Fetch>
        </div>
    )
  }
})
