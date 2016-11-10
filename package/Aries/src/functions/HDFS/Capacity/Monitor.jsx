import React from 'react'
import Task from 'public/Task'
import './index.less'
import Percentage from 'bfd-ui/lib/Percentage'

const TabMonitor = React.createClass({
  render: function() {
    let percentage = this.props.percentData.map((value,index)=>{
      let percen = 0;
      try{
        percen = value.used_capacity/value.total_capacity*100;
        if(isNaN(percen)){
          percen = 0;
        }
      }catch(err)
      {
         console.log(err);
         percen = 0;
      }
      console.log(`percen: ${percen}`);
      return <div className="col-sm-6 col-md-4 col-lg-3">
              <div className="thumbnail text-border" style={{width:'100px'}}><a href="javascript:">{value.name}</a></div>
              <div className="caption"><Percentage percent={percen} style={{width: '150px'}}></Percentage></div>
            </div>
    });
    return (
        <div className="row">
          {percentage}
        </div>
      );
    }
});
export default TabMonitor
