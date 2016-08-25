import React from 'react'
import Task from 'public/Task'
import CopyToClipboard from 'react-copy-to-clipboard';
import './index.less'
import DataTable from 'bfd-ui/lib/DataTable'
import Upload from 'bfd-ui/lib/Upload'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
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
    let deleteUrl = this.props.getUrlData({ type : "DELETE",
                                            spaceName : this.props.cur_space,
                                            relativePath : path
                                            });
    deleteUrl = deleteUrl.replace(/\/\//g,"/");
    console.log("trash path"+path);
    xhr({ type: 'DELETE',url:deleteUrl,
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
    let cur_path = `${this.props.cur_path}/${path}`;
    let compressUrl = this.props.getUrlData({ type : "COMPRESS",
                                              spaceName : this.props.cur_space,
                                              relativePath : cur_path
                                              });
    xhr({
      type: 'POST',url:compressUrl,
      success:data =>{
        //弹框提示数据正在压缩
        message.success(data,2);
      }
    })
  },
  share(path,component){
    let cur_path = `${this.props.cur_path}/${path}`
    console.log("share...."+cur_path);
    let shareUrl = this.props.getUrlData({ type : "SHARE",
                                           spaceName : this.props.cur_space,
                                           relativePath : cur_path
                                          });
    xhr({
      type: 'POST',url:shareUrl,
      success:data =>{
        this.proxy_path = data;
        this.setState({modalTitle:"share"});
        this.openModal();
      }
    })
  },
  downLoad(path,component){
    path = `${this.props.cur_path}/${path}`;
    let downloadUrl = this.props.getUrlData({ type : "DOWNLOAD",
                                              spaceName : this.props.cur_space,
                                              relativePath : path
                                            });
    xhr({type: 'GET',url: downloadUrl,success(data) {console.log(data)}});
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
    0:()=>{return <span><Icon type="file-text-o" /></span>},
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
    let renameUrl = this.props.getUrlData({ type : "RENAME",
                                            relativePath : sourcePath,
                                            spaceName : this.props.cur_space,
                                            targetPath : targetPath
                                          });
    xhr({type: 'PUT',url: renameUrl,
        success:data =>  {
          message.success(data, 2);
          let random = Math.floor(Math.random()*10000000000);
          this.props.updateRandom(random);
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
    let treePath = pathData.map((i,j)=>{return i.name}).join("/");
    console.log(treePath);
    let listChildrenTreeUrl = this.props.getUrlData({ type : "LIST_STATUS_TREE",
                                                    spaceName : this.props.cur_space,
                                                    relativePath : treePath
                                                    });
    this.treePath = treePath;
    return listChildrenTreeUrl;
  },
  modalBody:{
    move:function(){
       let listRootTreeUrl = this.props.getUrlData({ type : "LIST_STATUS_TREE",
                                                     spaceName : this.props.cur_space,
                                                     relativePath : "/"
                                                   });
       return <div>
               <div className="tree-div">
                 <Fetch style={{minHeight:100}} url={listRootTreeUrl} onSuccess={this.handleTreeSuccess}>
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
    let mkdirsUrl = this.props.getUrlData({ type: "MKDIRS",
                                          relativePath : new_relative_path,
                                          spaceName : this.props.cur_space
                                         });
    xhr({ type: 'POST',url: mkdirsUrl,
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
                { this.props.list == "ALL" ?[
                  <span>
                    <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.confirm_handler(cur_path,`你确定要分享 ${cur_path} 吗?`,this.share,component)}}> <Icon type="share-alt" /></a>
                    <a href="javascript:" style={{marginRight: '20px'}} onClick={()=>{this.confirm_handler(cur_path,`你确定要压缩 ${cur_path} 吗?`,this.compress,component)}}><Icon type="compress" /></a>
                    {component.is_dir < 1 ? [
                      <a href={`/v1/hdfs/${this.props.cur_path}/${cur_path}/?type=http&op=DOWNLOAD&space_name=${this.props.cur_space}`}
                        style={{marginRight: '20px'}}> <Icon type="download" /> </a>
                    ] : null}
                  </span>
                  ]: null}
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
