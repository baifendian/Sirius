import React from 'react'
import Task from 'public/Task'
import './index.less'
import Upload from 'bfd-ui/lib/Upload'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'
import Button from 'bfd/Button'

const Head = React.createClass({
  source_path:"",
  handleComplete(data){
    //上传完成处理
    message.success(data,2)
    let random = Math.floor(Math.random()*10000000000);
    this.props.updateRandom(random);
  },
  changeAddess(path){
    console.log(path);
    this.source_path = path;
  },
  mkdir(){
    this.props.addTableData();
  },
  render() {
    let uploadUrl = this.props.getUrlData({ type : "UPLOAD",
                                            relativePath : this.props.cur_path,
                                            spaceName : this.props.cur_space
                                          });
    let props={
        action:uploadUrl,
        multiple: false,
        onComplete:this.handleComplete
    }

    return (
      <div className="head">
      <div className="table-div">
        <Button onClick={this.mkdir}>新建文件夹</Button>
      </div>
       <div className="table-div">
           <Upload className="table-div" {...props} />
       </div>
      </div>
    )
  }
})

export default Head
