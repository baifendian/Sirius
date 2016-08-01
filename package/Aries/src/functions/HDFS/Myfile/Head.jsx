import React from 'react'
import Task from 'public/Task'
import './index.less'
import DataTable from 'bfd-ui/lib/DataTable'
import Upload from 'bfd-ui/lib/Upload'
import { Modal, ModalHeader, ModalBody } from 'bfd-ui/lib/Modal'
import ClearableInput from 'bfd-ui/lib/ClearableInput'
import xhr from 'bfd-ui/lib/xhr'
import Icon from 'bfd-ui/lib/Icon'
import confirm from 'bfd-ui/lib/confirm'
import Fetch from 'bfd-ui/lib/Fetch'
import { Select ,Option} from 'bfd-ui/lib/Select2'

const Head = React.createClass({
  getInitialState:function() {
   return {modalTitle:"upload",
           operate_type:"HTTP",
    };
  },
  source_path:"",
  selectChange(value){
    this.setState({operate_type:value});
  },
  uploadProps:{
    action:"",
    multiple: true,
  },
  changeAddess(path){
    console.log(path);
    this.source_path = path;
  },
  operate_type:{
    HTTP:function(){
            let action = `v1/hdfs/${this.props.cur_path}/?type=http&op=UPLOAD&space_name=${this.props.cur_space}`;
            this.uploadProps.action = action;
            return <div className="table-div">
                    <Upload className="table-div" {...this.uploadProps} />
                   </div>},
    FTP:function(){return <div className="table-div"><ClearableInput inline placeholder="请输入FTP地址" onChange={this.changeAddess} /></div>},
    CLIENT:function(){return <div className="table-div"><ClearableInput inline placeholder="请输入CLIENT地址" onChange={this.changeAddess} /></div> }
  },
  modalTitle:{
    copy:()=>{return "移动到"},
    upload:()=>{return "文件上传"},
    download:()=>{return "文件下载"}
  },
  modalBody:{
    upload:function(){
      return <div>
              <div className="tree-div">
                <div className="table-div">上传方式</div>
                <Select defaultValue="HTTP" onChange={this.selectChange}>
                  <Option value="HTTP">HTTP</Option>
                  <Option value="FTP">FTP</Option>
                  <Option value="CLIENT">CLIENT</Option>
                </Select>
                {this.operate_type[this.state.operate_type].call(this)}
              </div>
              <div className="btn-div">
                <button type="button" style={{marginLeft: '100px'}} onClick={this.upload} className="btn btn-primary" >保存</button>
                <button type="button" style={{marginLeft: '100px'}} onClick={this.closeModal} className="btn btn-primary" >取消</button>
              </div>
             </div>
    }
  },
  mkdir(){
    this.props.addTableData();
  },
  upload(){
    let operate_type = this.state.operate_type.toUpperCase();
    if(operate_type == "HTTP"){
      this.closeModal();
    }else{
      let hdfs_path = this.props.cur_path;
      let source_path = this.source_path;
      console.log(`hdfs_path:${hdfs_path}, source_path:${source_path}, operate_type: ${operate_type}`);
      let url = `v1/hdfs/${hdfs_path}/?type=${operate_type}&op=UPLOAD&source_path=${source_path}&space_name=${this.props.cur_space}`;
      xhr({
        type: 'POST',
        url: url,
        success(data) {
          console.log("ftp文件上传成功!");
        }
      });
      this.closeModal();
    }
  },
  uploadModal(){
    this.setState({modalTitle:"upload"});
    this.openModal();
  },
  openModal(){
    this.refs.modal.open();
  },
  closeModal(){
    this.refs.modal.close();
  },
  render() {
    return (
      <div className="head">
       <div className="table-div">
         <button type="button" style={{marginLeft:'50px'}} onClick={this.uploadModal} className="btn btn-primary" >文件上传</button>
       </div>
       <div className="table-div">
         <button type="button" style={{marginLeft:'50px'}} onClick={this.mkdir} className="btn btn-primary" >新建文件夹</button>
       </div>
       <Modal ref="modal">
         <ModalHeader>
           <h4 className="modal-title">{this.modalTitle[this.state.modalTitle].call(this)}</h4>
         </ModalHeader>
         <ModalBody>
           {this.modalBody[this.state.modalTitle].call(this)}
         </ModalBody>
       </Modal>

      </div>
    )
  }
})

export default Head
