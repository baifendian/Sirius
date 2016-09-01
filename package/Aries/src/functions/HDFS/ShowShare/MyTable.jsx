import React from 'react'
import Task from 'public/Task'
import CopyToClipboard from 'react-copy-to-clipboard';
import './index.less'
import { Select, Option } from 'bfd-ui/lib/Select2'
import DataTable from 'bfd-ui/lib/DataTable'
import Upload from 'bfd-ui/lib/Upload'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import ClearableInput from 'bfd-ui/lib/ClearableInput'
import xhr from 'bfd-ui/lib/xhr'
import Icon from 'bfd-ui/lib/Icon'
import confirm from 'bfd-ui/lib/confirm'
import Fetch from 'bfd-ui/lib/Fetch'
import TextOverflow from 'bfd-ui/lib/TextOverflow'
import Tree from 'bfd-ui/lib/Tree/Tree'
import { Form, FormItem } from 'bfd-ui/lib/Form'
import Editable from 'bfd-ui/lib/Editable'
import message from 'bfd-ui/lib/message'

const MyTable = React.createClass({
  confirm_handler(path,confirm_str,func,component){
    confirm(<TextOverflow><p style={{width: '250px'}}>{confirm_str}</p></TextOverflow>,()=>{
        func(path,component);
    });
  },
  trash(path,component){
    path = `${this.props.cur_path}/${path}`;
    let url = `v1/hdfs/${path}/?op=DELETE&spaceName=${this.props.cur_space}`.replace(/\/\//g,"/");
    console.log("trash path"+path);
    xhr({ type: 'DELETE',url:url,
        success: data =>{
          let dataTable = this.props.data;
          let totalList = this.props.data.totalList;
          let index = totalList.indexOf(component);
          totalList.splice(index,1);
          dataTable.totalList = totalList;
          this.props.updateTableData(dataTable,-1);
          console.log("-----trash-------");
          message.success(data,2);
        }
    });
  },
  compress(path,component){
    console.log("compress....."+path);
  },
  share(path,component){
    let cur_path = `${this.props.cur_path}/${path}`
    console.log("share...."+cur_path);
    let url = `v1/hdfs/${cur_path}/?permission=private&op=SHARE&Validity=10&space_name=${this.props.cur_space}`;
    xhr({
      type: 'POST',url:url,
      success:data =>{
        //弹框
        this.proxy_path = data;
        this.setState({modalTitle:"share"});
        this.openModal();
        //message.success(data,2)
      }
    })
  },
  downLoad(path,component){
    console.log("down load...."+path);
    path = `${this.props.cur_path}/${path}`;
    let url = `v1/hdfs/${path}/?type=http&op=DOWNLOAD`
    console.log(component);
  },
  move(path){
    this.tablePath = `${this.props.cur_path}/${path}`;
    this.setState({modalTitle:"move"});
    this.openModal();
  },
  treePath:"/",
  tablePath:"",
  selectPathTree:"",
  iconType:{
    0:()=>{return <span><Icon type="file" /></span>},
    1:()=>{return <span><Icon type="folder" /></span>}
  },
  modalTitle:{
    move:()=>{return "移动到"},
    share:()=>{return "分享成功"}
  },
  handleTreeSuccess:function(data){
    //每点击一次数据不断刷新
    this.setState({"treeData":data});
    this.openModal();
  },
  openModal(){
    this.refs.modal.open();
  },
  closeModal(){
    this.refs.modal.close();
  },
  saveModal(){
    //原,目标路径
    let targetPath =this.selectPathTree;
    let sourcePath = this.tablePath;
    console.log(`${sourcePath} --> ${targetPath}`);
    let url = `v1/hdfs/${sourcePath}/?op=RENAME&destination=${targetPath}&space_name=${this.props.cur_space}`;
    xhr({type: 'PUT',url: url,
        success:data =>  {
        message.success(data, 2);
      }
    });
    this.closeModal();
  },
  handleActive(value){
    let selectPathTree = value.map((i,j)=>{return i.name}).join("/");
    if(selectPathTree==""){
      console.log("handleActive is not select element");
    }else{
      selectPathTree = `/${selectPathTree}`;
      this.selectPathTree = selectPathTree;
      console.log(`selectPathTree: ${selectPathTree}`);

    }
  },
  getUrl(value,pathData){
    console.log(pathData);
    let treePath = pathData.map((i,j)=>{return i.name}).join("/");
    console.log(treePath);
    let url = `v1/hdfs//${treePath}/?op=LISTSTATUSTREE&spaceName=${this.props.cur_space}`;
    this.treePath=treePath;
    return url;
  },
  modalBody:{
    move:function(){
       let url = `v1/hdfs///?op=LISTSTATUSTREE&spaceName=${this.props.cur_space}`;
       return <div>
               <div className="tree-div">
                 <Fetch style={{minHeight:100}} url={url} onSuccess={this.handleTreeSuccess}>
                    <Tree data={this.state.treeData} getUrl={this.getUrl} onActive={this.handleActive}/>
                 </Fetch>
                </div>
                <div className="div-margin">
                  <button type="button" style={{marginLeft: '100px'}} onClick={this.saveModal} className="btn btn-primary" >保存</button>
                  <button type="button" style={{marginLeft: '100px'}} onClick={this.closeModal} className="btn btn-primary" >取消</button>
                </div>
             </div>
        },
    share:function(){
        return <div>
            <div>分享链接为:
                <a>{this.proxy_path}</a>
                <CopyToClipboard text={this.proxy_path}>
                    <button type="button" style={{marginLeft: '10px'}}className="btn btn-primary" >复制</button>
                </CopyToClipboard>
           </div>
        </div>
    },
  },
  skip(item,is_file=1){
    if(Number(is_file)==0){
      console.log("this is a file");
      return ;
    }
    this.props.updateCurRelativePath(item);
  },
  cancelEdit(value){
    //移除第一条记录
    let data = this.props.data;
    let totalList = data.totalList;
    totalList.shift();
    this.props.updateTableData(data,-1);
  },
  saveEdit(value){
    // send ajax
    //发送请求更新
    let new_relative_path = `${this.props.cur_path}/${value}`.replace("//","/");
    console.log(`new_relative_path:${new_relative_path} cur_space:${this.props.cur_space}`);
    xhr({ type: 'POST',url: `v1/hdfs/${new_relative_path}/?op=MKDIRS&spaceName=${this.props.cur_space}`,
        success:data1 =>  {
          let data = this.props.data;
          let totalList =data.totalList;
          console.log(data);
          //请求成功添加进表格
          let new_ele = totalList.shift();
          new_ele.name = value;
          new_ele.is_new = 1;
          totalList.unshift(new_ele);
          data.totalList = totalList;
          this.props.updateTableData(data,-1);
          console.log("----------saveEdit------------");
          message.success(data,2);
        }
    });

  },
  getInitialState:function(){
   return {
    modalTitle:'move',
    treeData:[],
    is_first:0,
    data:this.props.data,
    column:[{
    title:'文件名',
    key:'name',
    render:(item,component)=> {
      let cur_path=`/${item}`;
      cur_path = cur_path.replace("//","/");
      var itemText = "";
      if(component.is_new==0){
        itemText=<Editable defaultValue="new_dir" defaultEditing onChange={this.saveEdit} onCancel={this.cancelEdit} />;
      }else{
        itemText = <a href="javascript:void(0);" onClick={()=>{this.skip(cur_path,component.is_dir)}} >{item}</a>
      }
      return <div className="table-div">
              <div className="table-div">
                <a style={{marginRight: '5px'}}> {this.iconType[component.is_dir].call(this)} </a>
                {itemText}
              </div>
              <div className="table-div-icon div-float">
                <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.confirm_handler(cur_path,`你确定删除 ${cur_path} 吗?`,this.trash,component)}}> <Icon type="trash" /> </a>
                <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.move(cur_path)}}> <Icon type="arrows" /> </a>
              </div>
            </div>
      },
    },{
      title:'创建时间',
      key:'create_time',
    },{
       title:'大小',
       key:'size',
    }]}
  },
  render(){
    return <div className="mytable">
              <DataTable data={this.props.data} column={this.state.column}></DataTable>
              <Modal ref="modal">
                <ModalHeader>
                  <h4 className="modal-title">{this.modalTitle[this.state.modalTitle].call(this)}</h4>
                </ModalHeader>
                <ModalBody>
                  {this.modalBody[this.state.modalTitle].call(this)}
                </ModalBody>
              </Modal>
          </div>
  }
})
export default MyTable;
