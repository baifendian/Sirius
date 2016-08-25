import React from 'react'
import Task from 'public/Task'
import './index.less'
import Slider from 'bfd-ui/lib/Slider'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'

const TabMonitor = React.createClass({
  handleSlid(value,spaceName){
    console.log(`slid:${value}, spaceName:${spaceName}`);
    let upsetUrl = this.props.getUrlData({ type : "UPSET",
                                           spaceName : spaceName
                                          });
    xhr({type: 'PUT',url: upsetUrl,data:{"capacity":value},
      success(data) {
        message.success(data);
      }
    });
  },
  render:function(){
    let sliderData = this.props.sliderData.map((slider,i)=>{
      return  <div>
                  <div className="col-sm-5 col-md-5 col-lg-5">
                  {slider.name}<Slider defaultValue={slider.value} tickValue={10} start={0} end={slider.end} suffix="G"
                  onSlid={(value)=>{this.handleSlid(value,slider.name)}} />
                  </div>
              </div>
    });
    return <div>{sliderData}</div>
  }
});

export default TabMonitor
