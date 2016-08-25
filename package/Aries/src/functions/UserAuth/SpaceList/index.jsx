import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import Fetch from 'bfd-ui/lib/Fetch'
import SpaceInfo from './SpaceInfo'
import SpaceManager from './SpaceManager'
import { Select ,Option} from 'bfd-ui/lib/Select2'
import auth from 'public/auth'
import UserAuthConf from '../Conf/Conf'

export default React.createClass({
  getInitialState: function() {
    return {
      cur_space:0,
      url:"",
      is_admin:0,
      defaultValue:"0"
    };
  },
  refreshTable(){
    let url_end = Date.parse(new Date());
    let url_old = this.state.url;
    let url_start = url_old.split("?")[0];
    let url_new = `${url_start}?date=${url_end}`;
    this.setState({url:url_new});
  },
  getSpaceInfo(data){
    let is_admin = data.is_admin;
    console.log("is_admin:"+is_admin);
    this.setState({is_admin:is_admin});
  },
  initCurSpace(data){
    let cur_space = data.space_id;
    let url = this.getUrlData({ type : SPACE_MEMBER_NO,
                                spaceName : cur_space
                    });
    this.setState({cur_space:cur_space,url:url});
  },
  requestArgs:{
    moduleName:"SpaceList",
    type:"",
    spaceName:"",
    spaceId:"",
    filter:""
  },
  getUrlData({type="",spaceName="",relativePath="",targetPath="",shareId=""}){
    this.requestArgs.type = type;
    this.requestArgs.spaceName = spaceName;
    this.requestArgs.relativePath = relativePath;
    this.requestArgs.targetPath = targetPath;
    this.requestArgs.shareId = shareId;
    return UserAuthConf.getUrlData(this.requestArgs);
  },
  render() {
    let spaceInfoUrl = this.getUrlData({ type : "SPACE_INFO",
                                         spaceName : this.state.cur_space
                                        });
    let filter = this.props.location.query.cur_space;
    if(filter==undefined){
      filter = auth.user.cur_space;
    }
    let spaceCurUrl = this.getUrlData({ type : "SPACE_CUR",
                                        filter : filter
                                      });
    return (
       <div>
        <Tabs>
          <TabList>
            <Tab>成员管理</Tab>
          </TabList>
          <TabPanel>
          <Fetch style={{minHeight:100}} url={spaceInfoUrl} onSuccess={this.getSpaceInfo}>
            <SpaceManager getUrlData={this.getUrlData} url={this.state.url} refreshTable={this.refreshTable} cur_space={this.state.cur_space} is_admin={this.state.is_admin} />
          </Fetch>
          </TabPanel>
        </Tabs>
        <Fetch style={{minHeight:0}} url={spaceCurUrl} onSuccess={this.initCurSpace}>
        </Fetch>
        </div>
    )
  }
})
