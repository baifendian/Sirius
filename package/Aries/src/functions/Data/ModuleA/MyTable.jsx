import React from 'react'
import Task from 'public/Task'
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
  downLoad(path,component){
    path = `${this.props.cur_path}/${path}`;
    let url = `/v1/hdfs/${path}/?type=http&op=DOWNLOAD`
  },
  copy(path){
    this.tablePath = `${this.props.cur_path}/${path}`;
    this.setState({modalTitle:"copy"});
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
    copy:()=>{return "复制到"},
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
    let url = `/hdfs/${sourcePath}/?op=RENAME&destination=${targetPath}&space_name=${this.props.cur_space}`;
    xhr({type: 'PUT',url: url,
      success(data) {
        message.success(data, 2);
      }
    });
    this.closeModal();
  },
  handleActive(value){
    let selectPathTree = value.map((i,j)=>{return i.name}).join("/");
    if(selectPathTree==""){
      message.success("请选择复制的目标目录!",2);
    }else{
      selectPathTree = `/${selectPathTree}`;
      this.selectPathTree = selectPathTree;
    }
  },
  getUrl(value,pathData){
    let treePath = pathData.map((i,j)=>{return i.name}).join("/");
    let url = `/hdfs//${treePath}/?op=LISTSTATUSTREE&spaceName=${this.props.cur_space}`;
    this.treePath=treePath;
    return url;
  },
  modalBody:{
    copy:function(){
       let url = `/hdfs///?op=LISTSTATUSTREE&spaceName=${this.props.cur_space}`;
       return <div>
               <div className="function-hdfs-tree-div">
                 <Fetch style={{minHeight:100}} url={url} onSuccess={this.handleTreeSuccess}>
                    <Tree data={this.state.treeData} getUrl={this.getUrl} onActive={this.handleActive}/>
                 </Fetch>
                </div>
                <div className="function-hdfs-margin-div">
                  <button type="button" style={{marginLeft: '100px'}} onClick={this.saveModal} className="btn btn-primary" >保存</button>
                  <button type="button" style={{marginLeft: '100px'}} onClick={this.closeModal} className="btn btn-primary" >取消</button>
                </div>
             </div>
        },
  },
  skip(item,is_file=1){
    if(Number(is_file)==0){
      return ;
    }
    this.props.updateCurRelativePath(item);
  },
  getInitialState:function(){
   return {
    modalTitle:'copy',
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
      return <div className="function-hdfs-table-div">
              <div className="function-hdfs-table-div">
                <a style={{marginRight: '5px'}}> {this.iconType[component.is_dir].call(this)} </a>
                {itemText}
              </div>
              <div className="function-hdfs-table-div function-hdfs-table-div-float">
                <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.confirm_handler(cur_path,`你确定要下载 ${cur_path} 吗?`,this.downLoad,component)}}> <Icon type="download" /> </a>
                <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.copy(cur_path)}}> <Icon type="copy" /> </a>
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
    return <div>
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
