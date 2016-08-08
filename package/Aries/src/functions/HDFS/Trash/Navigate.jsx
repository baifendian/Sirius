import React from 'react'
import Task from 'public/Task'
import './index.less'

const Navigate = React.createClass({
  skip(path){
    this.props.updateSkipUrl(path);
  },
  listManager:{
    0:function(){
      return <div className="div-margin">
            <span>全部文件</span>
            <span className="list-tips">已全部加载, 共{this.props.num}个</span>
            </div>
    },
    1:function(){
      var ret = [];
      var full_path =`${this.props.cur_path}`;
      var dirs = full_path.split("/").filter((item)=>{return item!=""});
      var last_path = "/"+dirs.slice(0,dirs.length-1).join("/");
      var head = <span>
        <a href="javascript:" onClick={()=>{this.skip(last_path)}}>返回上一级</a> |
        <a href="javascript:" onClick={()=>{this.skip("/")}}>全部文件</a> >
        </span>
      ret.push(head);
      var len = dirs.length;
      var cur_path="";
      if(len>3){
        ret.push(<span> ... > </span>)
      }
      dirs.forEach((dir,i)=>{
        cur_path = `${cur_path}/${dir}`;
        var cur_path1 = cur_path;
        if(len<=3){
          if(i==(dirs.length-1)){
            ret.push(<span>{dir} </span>)
          }else{
            ret.push(<span><a href="javascript:" onClick={()=>{this.skip(cur_path1)}} >{dir} </a> > </span>)
          }
        }else{
          if(i>(len-4)){
            if(i==(dirs.length-1)){
              ret.push(<span>{dir} </span>)
            }else{
              ret.push(<span><a href="javascript:" onClick={()=>{this.skip(cur_path1)}} >{dir} </a> > </span>)
            }
          }
        }
      });
      return <div className="div-margin">{ret} <span className="list-tips">已全部加载, 共{this.props.num}个</span></div>;
    }
  },
  getInitialState: function() {
    return {
      is_first:0,
    };
  },
  render(){
        return <div  className="navigate">
                {this.listManager[this.props.is_first].call(this)}
               </div>
  }
});

export default Navigate;
