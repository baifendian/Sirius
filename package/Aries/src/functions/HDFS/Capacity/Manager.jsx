import React from 'react'
import Task from 'public/Task'
import './index.less'
import Slider from 'bfd-ui/lib/Slider'


const TabMonitor = React.createClass({
  handleSliding(value){
    console.log('sliding'+value);
  },
  handleSlid(value){
    console.log('slid:'+value);
  },
  render:function(){
    let sliderData = this.props.sliderData.map((i,slider)=>{
       return    <div className="row">
                      <div className="col-sm-5 col-md-5 col-lg-5">
                      <div>{slider.name}</div>
                      <Slider defaultValue={300} tickValue={10} start={0} end={500} suffix="G"
                      onSliding={this.handleSliding} onSlid={this.handleSlid} />
                      </div>
                  </div>
    });
    return <div>{sliderData}</div>
  }
});

export default TabMonitor
