import React from 'react'
import Task from 'public/Task'
import './index.less'
import Upload from 'bfd-ui/lib/Upload'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'
import Button from 'bfd/Button'

const Head = React.createClass({
  source_path:"",
  uploading:{
    0:function(){
        let width_px = 400 * (this.state.uploadNumber/100.0);
        let percen = `${this.state.uploadNumber}%`;
        let progress_bar = <div className="progress-bar">
                              <div className="progress">
                                <span className="green" style={{width:width_px}}>
                                  <span>{percen}</span>
                                </span>
                              </div>
                            </div>
        return <div className="upload-modal">{progress_bar}</div>
      }, //上传中的状态
    1:()=>{return null}
  },
  handleComplete(data){
    //上传完成处理
    this.setState({isUploading:1,uploadNumber:0})
    message.success(data,2)
    let random = Math.floor(Math.random()*10000000000);
    this.props.updateRandom(random);
  },
  handleUploading(data){
    console.log(`process: ${data}`);
    if(Number(data)==100){
      this.setState({isUploading:1,uploadNumber:0});
    }else{
      this.setState({isUploading:0,uploadNumber:data});
    }
  },
  changeAddess(path){
    console.log(path);
    this.source_path = path;
  },
  mkdir(){
    this.props.addTableData();
  },
  getInitialState:function(){
    return {
      uploadNumber:0, //当前上传百分比
      isUploading:1, //是否是上传中
    }
  },
  render() {
    let uploadUrl = this.props.getUrlData({ type : "UPLOAD",
                                            relativePath : this.props.cur_path,
                                            spaceName : this.props.cur_space
                                          });
    let props={
        action:uploadUrl,
        multiple: false,
        onComplete: this.handleComplete,
        onUplading: this.handleUploading,
        showFileList: false,
    }

    return (
      <div className="head">
      <div className="table-div">
        <Button onClick={this.mkdir}>新建文件夹</Button>
      </div>
       <div className="table-div">
           <Upload className="table-div" {...props} />
       </div>
       {this.uploading[this.state.isUploading].call(this)}
      </div>
    )
  }
})

export default Head
