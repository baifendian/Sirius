import React from 'react'
import Task from 'public/Task'
import './index.less'

const Top = React.createClass({
  switchContainer(hostname){
    this.props.updateData(hostname);
  },
  container:{
    healthy:function(hostname){return <div onClick={()=>{this.switchContainer(hostname)}} className="container healthy"></div>},
    except:function(hostname){return <div onClick={()=>{this.switchContainer(hostname)}}  className="container except"></div>},
    select:function(hostname){return <div onClick={()=>{this.switchContainer(hostname)}}  className="container select"></div>}
  },
  render:function(){
    let selectHost = this.props.selectHost;
    let containers = this.props.data.map((container)=>{
      //遍历的时候处理是否选中
      console.log(container.hostname+"----"+this.props.selectHost);
      if(container.hostname == this.props.selectHost){
        return this.container["select"].call(this,container.hostname);
      }else{
        return this.container[container.status].call(this,container.hostname);
      }
    });
    return <div className="top">
              <div>
                    {containers}
              </div>
           </div>
  }
});

export default Top;
