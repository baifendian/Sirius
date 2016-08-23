import React from 'react'
import Task from 'public/Task'
import './index.less'
import Slider from 'bfd-ui/lib/Slider'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'

const TabMonitor = React.createClass({
  handleSlid(value,space_name){
    console.log(`slid:${value}, space_name:${space_name}`);
    let url = `v1/hdfs///?op=UPSET&space_name=${space_name}`;
    xhr({type: 'PUT',url: url,data:{"capacity":value},
      success(data) {
        message.success(data);
      }
    });

  },
  render:function(){
    let sliderData = this.props.sliderData.map((slider,i)=>{
      return  <div >
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
