import React from 'react'
import Task from 'public/Task'
import './index.less'
import FixedTable from 'bfd/FixedTable'
import confirm from 'bfd-ui/lib/confirm'
import Fetch from 'bfd-ui/lib/Fetch'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import Icon from 'bfd-ui/lib/Icon'
import message from 'bfd-ui/lib/message'
import {Link} from 'react-router'
import HdfsConf from '../Conf/HdfsConf'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({
  handleSuccess(data){
    console.log(data);
    this.setState({data:data.totalList});
  },
  getInitialState: function() {
    return {
             totalNum:0,
             column:[{
              title:"id",
              key:"id",
              render:(item, component)=> {
                  let proxy_path = component.proxy_path;
                  let proxy_arr = proxy_path.split("/").slice(-4);
                  let proxyStr = proxy_arr.join("/")
                  let spaceName = HdfsConf.getCurSpace(this);
                  let url = `/${proxyStr}?cur_space=${spaceName}`;
                  return <Link to={url}>{component.id}</Link>
              },
             },{
              title:"分享链接",
              key:"proxy_path",
              render:(item, component)=> {
                let proxy_path = component.proxy_path;
                let proxy_arr = proxy_path.split("/").slice(-4);
                let proxyStr = proxy_arr.join("/")
                let spaceName = HdfsConf.getCurSpace(this);
                let url = `/${proxyStr}?cur_space=${spaceName}`;
                return <Link to={url}>{component.proxy_path}</Link>
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
              render:(item, component)=> {
                return <TextOverflow>
                        <p style={{width: '100px'}}>{item}</p>
                      </TextOverflow>

              },
             }]
            };
  },
  requestArgs:{
    pageName : "ShareCenter",
    type : "",
    spaceName : "",
  },
  getUrlData({type="",spaceName=""}){
    this.requestArgs.type = type;
    this.requestArgs.spaceName = spaceName;
    return HdfsConf.getUrlData(this.requestArgs);
  },
  render() {
    let spaceName = HdfsConf.getCurSpace(this);
    let shareUrl = this.getUrlData({ type : "SHARE",
                                     spaceName : spaceName
                                    });
    return (
        <div>
          <NavigationInPage headText={HdfsConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={HdfsConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
          <Fetch style={{minHeight:0}} url={shareUrl} onSuccess={this.handleSuccess}>
            <FixedTable height={300} data={this.state.data} column={this.state.column}></FixedTable>
          </Fetch>
        </div>
    )
  }
})
