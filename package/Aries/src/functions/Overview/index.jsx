import React from 'react'
import { Checkbox } from 'bfd/Checkbox'
import './index.less'
import Percentage from 'bfd-ui/lib/Percentage'
import auth from 'public/auth'

export default React.createClass({
  index:()=>{
    let cur_space = auth.user.cur_space;
    let type = auth.user.type;
    if(cur_space== "" && type < 1){
      return <div>您还不属于任何space.请联系space管理员进行添加.</div>
    }
    if(cur_space== "" && type >0){
      return <div>您还没有创建任何space.请先创建space</div>
    }
    return <div className="row">
        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="thumbnail function-service-div-border" style={{width:'100px'}}><a href="javascript:">space1</a></div>
          <div className="caption"><Percentage percent={30} style={{width: '150px'}}></Percentage></div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3">
          <div className="thumbnail function-service-div-border" style={{width:'100px'}}><a href="javascript:">space2</a></div>
          <div className="caption"><Percentage percent={30} style={{width: '150px'}}></Percentage></div>
        </div>
      </div>

  },
  render() {
      let conent = this.index();
      return (
          <div>{conent}</div>
        )
  }
})
