import React from 'react'
import './index.less'
import { Row, Col } from 'bfd/Layout'
import auth from 'public/auth'
import Fetch from 'bfd/Fetch'
import echarts from 'echarts'
import OverviewConf from './OverviewConf'
import EchartsUtil from 'public/Template/Echarts/EchartsUtil'
import common from 'public/Template/Echarts/common'

export default React.createClass({
  getInitialState: function(){
    return {
        random: 0,
        hdfs_disk: { //hdfs磁盘
          used: 0,
          nonUsed: 1,
          unit: "TB",
          total: 1,
        },
        hdfs_shares: 0, //HDFS分享文件的个数
        hdfs_datanodes: { //hdfs datanode状态
          lives: 0,
          dead: 0,
          total: 0
        },
        codis_cluster: {
          lives: 0,
          dead: 0,
          total: 0,
        },
        codis_memory: {
          used: 1,
          nonUsed: 1,
          unit: "GB",
          total: 2
        },
        k8sp_pod: {
          lives: 0,
          dead: 0,
          total: 0
        },
        k8sp_rc: {
          lives: 0,
          dead: 0,
          total: 0
        },
        k8sp_service: 0, //Service状态
        k8sp_nodes: {
          lives: 0,
          dead: 0,
          total: 0
        },
        bdms_task: {
          running: 0, //运行中
          waiting: 0, //等待中
          success: 0, //成功
          failed: 0, //失败
          total: 0 //总数
        },
        openstack_vm: {
          lives: 0, //正常
          dead: 0, //异常
          total: 0, //总数
        },
        openstack_image: 0, //镜像个数
        openstack_disk: 0, //云硬盘个数
        userAuth_member: 0, //当前space成员个数
    };
  },
  echartsMapping:{},
  index(){
    let cur_space = auth.user.cur_space;
    let type = auth.user.type;
    if(cur_space== "" && type < 1){
      return <div>您还不属于任何space.请联系space管理员进行添加.</div>
    }
    if(cur_space== "" && type >0){
      return <div>您还没有创建任何space.请先创建space</div>
    }
    let data = OverviewConf.overviewData;
    let overviewBody = data.map(function(item,index){
      //渲染图表div.
      let cid = item.id;
      let content = item.content.map(function(item,index){
        let id = `echarts_${cid}_${index}`
        let echart_div = "";
        item = common.tempPreHandler(item,this.state[item.stateName]);
        switch(item.type){
          case "pie":
            echart_div =  <div id={id} className="diagram-div"></div>;
          case "pieSubarea":
            echart_div = <div id={id} className="diagram-div"></div>
            break;
          default:
            echart_div = <div className="container-body">
                           {item.value}
                         </div>
        }
        //渲染描述
        let echart_desc = <div className="chart-hover" dangerouslySetInnerHTML={{__html: item.desc}}></div>
        return <div className="container-div" key={index}>
                 <div className="container-head">
                   {item.name}
                 </div>
                 {echart_div}
                 {echart_desc}
               </div>
      },this);
      return content
    },this);
    return <div>{overviewBody}</div>
  },
  echartsData(type,item){
    //获取echart数据
    let data = item.value;
    switch(type.toLocaleLowerCase()){
      case "pie":
      case "piesubarea":
        break;
      default:
        console.log(`该类型图表暂不支持! type:${type}`);
        break;
    }
    return data;
  },
  componentDidMount: function () {
    //从模版中取数据渲染
    let data = OverviewConf.overviewData;
    data.map(function(item,index){
      //渲染图表div.
      let title = item.title;
      let cid = item.id;
      let content = item.content.map(function(item,index){
        let id = `echarts_${cid}_${index}`
        let type = item.type;
        if( type != undefined ){
          let data = this.echartsData(type,item);
          let option = EchartsUtil.renderOptionData(type,data);
          this.echartsMapping[index] = echarts.init(document.getElementById(id)).setOption(option);
        }
      },this);
      return content
    },this);
  },
  requestArgs:{
    pageName : "Overview",
    type : "",
    spaceName : "",
    random : 0,
  },
  getUrlData({type="",spaceName=""}){
    this.requestArgs.type = type;
    this.requestArgs.spaceName = spaceName;
    this.requestArgs.random = this.state.random;
    return OverviewConf.getUrlData(this.requestArgs);
  },
  getBdmsData(data){
    let total = data.running + data.waiting + data.failed + data.success;
    data["total"] = total;
    this.setState({ bdms_task: data});
  },
  getK8spData(data){
    this.setState({ k8sp_rc: data.rc,
                    k8sp_pod: data.pod,
                    k8sp_nodes: data.node,
                    k8sp_service: data.service
                  });
  },
  getCodisData(data){
    this.setState({ codis_cluster: data.codis_cluster,
                    codis_memory: data.codis_memory
    });
  },
  getOpenstackData(data){
    this.setState({ openstack_disk: data.openstack_disk,
                    openstack_image: data.openstack_image,
                    openstack_vm: data.openstack_vm
    });
  },
  getHdfsData(data){
    this.setState({ hdfs_datanodes: data.hdfs_datanodes,
                    hdfs_disk: data.hdfs_disk,
                    hdfs_shares: data.hdfs_shares
    });
  },
  getUserAuthData(data){
    this.setState({ userAuth_member: data.userAuth_member});
  },
  render() {
    let spaceName = OverviewConf.getCurSpace(this);
    let bdms_url = this.getUrlData({ type: "BDMS_OVERVIEW",
                                     spaceName: spaceName,
                  });
    let k8sp_url = this.getUrlData({ type: "K8SP_OVERVIEW",
                                     spaceName: spaceName
                  });
    let codis_url = this.getUrlData({ type: "CODIS_OVERVIEW",
                                     spaceName: spaceName
                  });
    let hdfs_url = this.getUrlData({ type: "HDFS_OVERVIEW",
                                     spaceName: spaceName
                  });
    let user_url = this.getUrlData({ type: "USER_AUTH_OVERVIEW",
                                     spaceName: spaceName
                  });
    let openstack_url = this.getUrlData({ type: "OPENSTACK_OVERVIEW",
                                      spaceName: spaceName
                  });
    return (
        <div className="overview">
          {this.index()}
          {/* */}
          <Fetch defaultHeight={0} url={`${bdms_url}`} onSuccess={this.getBdmsData} />
          <Fetch defaultHeight={0} url={`${hdfs_url}`} onSuccess={this.getHdfsData} />
          <Fetch defaultHeight={0} url={`${codis_url}`} onSuccess={this.getCodisData} />
          <Fetch defaultHeight={0} url={`${user_url}`} onSuccess={this.getUserAuthData} />
          <Fetch defaultHeight={0} url={`${k8sp_url}`} onSuccess={this.getK8spData} />
          <Fetch defaultHeight={0} url={`${openstack_url}`} onSuccess={this.getOpenstackData} />

        </div>
      )
  }
})
