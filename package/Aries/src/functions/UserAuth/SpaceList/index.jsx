import React from 'react'
import Task from 'public/Task'
import './index.less'
import { Tabs, TabList, Tab, TabPanel } from 'bfd-ui/lib/Tabs'
import Fetch from 'bfd-ui/lib/Fetch'
import SpaceManager from './SpaceManager'
import { Select ,Option} from 'bfd-ui/lib/Select2'
import auth from 'public/auth'
import UserAuthConf from '../Conf/UserAuthConf'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({
  getInitialState: function() {
    return {
      spaceId:0,
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
    let spaceId = data.space_id;
    let url = this.getUrlData({ type : "SPACE_MEMBER_NO",
                                spaceId : spaceId
                    });
    this.setState({spaceId:spaceId,url:url});
  },
  requestArgs:{
    pageName:"SpaceList",
    type:"",
    spaceName:"",
    spaceId:"",
  },
  getUrlData({type="",spaceName="",spaceId=""}){
    this.requestArgs.type = type;
    this.requestArgs.spaceName = spaceName;
    this.requestArgs.spaceId = spaceId;
    return UserAuthConf.getUrlData(this.requestArgs);
  },
  render() {
    let spaceName = UserAuthConf.getCurSpace(this);

    let spaceInfoUrl = this.getUrlData({ type : "SPACE_INFO",
                                         spaceId : this.state.spaceId
                                        });
    let spaceCurUrl = this.getUrlData({ type : "SPACE_CUR",
                                        spaceName : spaceName
                                      });
    return (
       <div>
        <NavigationInPage headText={UserAuthConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={UserAuthConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
        <Tabs>
          <TabList>
            <Tab>成员管理</Tab>
          </TabList>
          <TabPanel>
          <Fetch style={{minHeight:100}} url={spaceInfoUrl} onSuccess={this.getSpaceInfo}>
            <SpaceManager getUrlData={this.getUrlData} url={this.state.url} refreshTable={this.refreshTable} spaceId={this.state.spaceId} is_admin={this.state.is_admin} />
          </Fetch>
          </TabPanel>
        </Tabs>
        <Fetch style={{minHeight:0}} url={spaceCurUrl} onSuccess={this.initCurSpace}>
        </Fetch>
        </div>
    )
  }
})
