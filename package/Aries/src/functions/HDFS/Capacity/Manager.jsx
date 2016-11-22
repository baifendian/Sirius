import React from 'react'
import Task from 'public/Task'
import './index.less'
import Slider from 'bfd-ui/lib/Slider'
import xhr from 'bfd-ui/lib/xhr'
import message from 'bfd-ui/lib/message'

const TabManager = React.createClass({
  handleSlid(value,spaceName,unit){
    console.log(`slid:${value}, unit:${unit} spaceName:${spaceName}`);
    //根据单位换算成G保存到后端
    switch (unit.toLocaleUpperCase()) {
      case "TB":
        value = value * 1024;
        break;
      case "PB":
        value = value * 1024 * 1024;
        break;
      default:
        break;
    }
    let upsetUrl = this.props.getUrlData({ type : "UPSET",
                                           spaceName : spaceName
                                          });
    xhr({type: 'PUT',url: upsetUrl,data:{"capacity":value},
      success: data => {
        message.success(data);
        //刷新配额管理
        this.props.refreshCapacity();
      }
    });
  },
  render:function(){
    let sliderData = this.props.sliderData.map((slider,i)=>{
      return  <div>
                  <div className="col-sm-5 col-md-5 col-lg-5">
                  {slider.name}<Slider defaultValue={slider.value} tickValue={10} start={0} end={slider.end} suffix={slider.unit}
                  onSlid={(value)=>{this.handleSlid(value,slider.name,slider.unit)}} />
                  </div>
              </div>
    });
    return <div>{sliderData}</div>
  }
});

export default TabManager
