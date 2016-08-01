import React from 'react'
import Task from 'public/Task'
import './index.less'

const Head = React.createClass({
  statusFilter(status){
    this.props.statusFilter(status);
  },
  render:function(){
    return <div className="head">
      <div className="healthy container" onClick={()=>{this.statusFilter("healthy")}}><div className="round"></div>健康</div>
      <div className="except container" onClick={()=>{this.statusFilter("except")}}><div className="round"></div>异常</div>
      <div className="select container" onClick={()=>{this.statusFilter("select")}}><div className="round"></div>当前</div>
      <div className="all container" onClick={()=>{this.statusFilter("all")}}><div className="round"></div>全部</div>
    </div>
  }
});

export default Head;
