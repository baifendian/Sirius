import React from 'react'
import Task from 'public/Task'
import './index.less'
import confirm from 'bfd-ui/lib/confirm'
import Fetch from 'bfd-ui/lib/Fetch'
import MyTable from '../Myfile/MyTable'
import Navigate from '../Myfile/Navigate'
import HdfsConf from '../Conf/HdfsConf'
import NavigationInPage from 'public/NavigationInPage'

export default React.createClass({
  getInitialState:function(){
    return {
      data:[],
      spaceData:[],
      tableData:{"totalList":[],"currentPage": 1,"totalPageNum": 500},
      cur_relative_path:"/",
      is_first:0,
      num:10,
      treePath:"/",
    };
  },
  updateTableList(data,num){
    this.setState({data:data,num:num});
  },
  componentWillReceiveProps(){
    this.setState({"cur_relative_path":"/","is_first":0});
  },
  updateSpace(cur_space){
    let is_first=0;
    let cur_relative_path = "/";
    this.setState({cur_space:cur_space,is_first:0,cur_relative_path:cur_relative_path});
  },
  getTableSuccess(data){
    //当前只获取了表格的数据。其实还应该获取表格的总记录数. // num
    this.setState({tableData:data,num:data.totalPageNum});
  },
  updateSkipUrl(url){
    let is_first = this.state.is_first;
    if(url=="/" || url==""){
      is_first = 0;
    }
    this.setState({cur_relative_path:url,is_first:is_first});
  },
  updateCurRelativePath(crp){
    //修改当前路径
    let old_relative_path = this.state.cur_relative_path;
    let cur1_relative_path =  `${old_relative_path}${crp}`;
    let cur_relative_path1 = cur1_relative_path.replace("//","/");
    this.setState({cur_relative_path:cur_relative_path1,is_first:1});
  },
  updateTableData(data,num){
    //data: new data array, num: num operator
    let old_num  = this.state.num;
    let cur_num = old_num+num;
    this.setState({tableData:data,num:cur_num});
  },
  addTableData(){
    let data = this.state.tableData;
    let row = {"name":"new_dir","create_time":"2015-02-10 10:11","size":"0","is_dir":"1","is_new":0};
    let totalList = data.totalList;
    totalList.unshift(row);
    data.totalList =totalList;
    let num = this.state.num+1;
    this.setState({tableData:data,num:num});
  },
  requestArgs:{
    pageName:"Trash",
    type:"",
    spaceName:"",
    relativePath:"",
    targetPath:"",
  },
  getUrlData({type="",spaceName="",relativePath="",targetPath=""}){
    this.requestArgs.type = type;
    this.requestArgs.spaceName = spaceName;
    this.requestArgs.relativePath = relativePath;
    this.requestArgs.targetPath = targetPath;
    return HdfsConf.getUrlData(this.requestArgs);
  },
  render(){
    let spaceName = HdfsConf.getCurSpace(this);
    let listStatusUrl = this.getUrlData({ type : "LIST_STATUS",
                                          relativePath : this.state.cur_relative_path,
                                          spaceName : spaceName
                                        });
    return (
      <div className="hdfs-myfile">
        <NavigationInPage headText={HdfsConf.getNavigationData({pageName : this.requestArgs.pageName, type : "headText"})} naviTexts={HdfsConf.getNavigationData({pageName:this.requestArgs.pageName,type:"navigationTexts",spaceName:spaceName})} />
        <Navigate cur_path={this.state.cur_relative_path} is_first={this.state.is_first} num={this.state.num} updateSkipUrl={this.updateSkipUrl} />
        <MyTable list="" data={this.state.tableData} getUrlData={this.getUrlData} cur_path={this.state.cur_relative_path} cur_space={spaceName} updateCurRelativePath={this.updateCurRelativePath} updateTableData={this.updateTableData} />
        <Fetch style={{minHeight:100}} url={listStatusUrl} onSuccess={this.getTableSuccess}>
        </Fetch>
      </div>
    )
  }
})
