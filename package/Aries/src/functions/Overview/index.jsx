import React from 'react'
import './index.less'
import { Row, Col } from 'bfd/Layout'
import auth from 'public/auth'
import Fetch from 'bfd/Fetch'
import echarts from 'echarts'
import OverviewConf from './OverviewConf'
import EchartsUtil from 'public/Template/Echarts/EchartsUtil'
import common from 'public/Template/echarts/common'

export default React.createClass({
  getInitialState:function(){
    return {
        random: 0,
        //hdfs_disk_used: 0, //HDFS使用百分比
        hdfs_disk_used: {
          used: 100,
          nonUsed: 50,
          unit: "TB",
          total: 0,
        },
        hdfs_shares: 0, //HDFS分享文件的个数
        //hdfs_datanodes: "0/0", //HDFS datanode健康状态(99/100)
        hdfs_datanodes: {
          lives: 0,
          dead: 0,
          total: 0
        },
        //codis_count: "0/0", //Codis 集群总个数(10/11,正常集群／总集群)
        codis_count: {
          lives: 0,
          dead: 0,
          total: 0,
        },
        //codis_memory_used: 0, //Codis 内存使用率50%
        codis_memory_used:{
          used: 100,
          nonUsed: 50,
          unit: "GB"
        },
        //k8sp_pod_count: "0/0", //Pod个数(9/10)
        k8sp_pod_count: {
          lives: 0,
          dead: 0,
          total: 0
        },
        //k8sp_rc_count: "0/0", //rc(9/10)
        k8sp_rc_count: {
          lives: 0,
          dead: 0,
          total: 0
        },
        k8sp_service_status_count: 0, //Service状态
        //k8sp_nodes_count: 0, //Node个数
        k8sp_nodes_count: {
          lives: 0,
          dead: 0,
          total: 0
        },
        bdms_task_count: {
          running: 0, //运行中
          waiting: 0, //等待中
          success: 0, //成功
          failed: 0, //失败
          total: 0 //总数
        },
        //openstack_vm_count: "0/0", //虚拟机(9/10)
        openstack_vm_count:{
          lives: 0, //正常
          dead: 0, //异常
          total: 0, //总数
        },
        openstack_image_count: 0, //镜像个数
        openstack_disk_count: 0, //云硬盘个数
        userAuth_member_count: 0, //当前space成员个数
    };
  },
  echartsMapping:{},
  index(){
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
        let echart_desc = <div className="chart-hover">{item.desc}</div>
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
      /*
      case "gauge":
        data = {name: "", data: [{value: this.state[value], name: ""}]};
        break;
      case "pienumber":
        data = {name:value, text:this.state[value]};
        break;
      */
      case "pie":
        break;
      case "piesubarea":
        //组合需要单独处理
        console.log(data);
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
        //根据不用的图表渲染不同的数据
        //let data = {name: "", data: [{value: 50, name: item.name}]};
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
    this.setState({
      bdms_running_count: data.today_running_task,
      bdms_success_count: data.today_succeed_task,
      bdms_failed_count: data.today_failed_task,
      bdms_task_count: data.today_total_task
    });
  },
  getK8spData(data){
    let k8sp_pod_count = `${data.pod.count}/${data.pod.total}`;
    let k8sp_rc_count = `${data.rc.count}/${data.rc.total}`;
    let k8sp_service_status_count = `${data.service.count}`;
    let k8sp_nodes_count = data.node.count;
    this.setState({
      k8sp_pod_count: k8sp_pod_count,
      k8sp_rc_count: k8sp_rc_count,
      k8sp_service_status_count: k8sp_service_status_count,
      k8sp_nodes_count: k8sp_nodes_count
    });
  },
  getCodisData(data){
    let codis_count = `${data.nice_codis_count}/${data.all_codis_count}`;
    let codis_memory_used = data.memory_used_count.toFixed(2)/data.memory_total_count;
    codis_memory_used = `${codis_memory_used.toFixed(2)*100} %`;
    this.setState({
      codis_count: codis_count,
      codis_memory_used: codis_memory_used,
    });
  },
  getOpenstackData(data){
    this.setState({
      openstack_vm_count:data.vm,
      openstack_image_count:data.image,
      openstack_disk_count:data.volume
    });
  },
  getHdfsData(data){
    let hdfs_disk_used = data.hdfs_disk_used * 100;
    hdfs_disk_used = hdfs_disk_used.toFixed(2);
    this.setState({
      hdfs_disk_used: `${hdfs_disk_used} %`,
      hdfs_shares: data.hdfs_shares,
      hdfs_datanodes: data.hdfs_datanodes
    });
  },
  getUserAuthData(data){
    this.setState({
      userAuth_member_count: data.count
    });
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
          {/*
          <Fetch defaultHeight={0} url={`${bdms_url}`} onSuccess={this.getBdmsData} />
          <Fetch defaultHeight={0} url={`${hdfs_url}`} onSuccess={this.getHdfsData} />
          <Fetch defaultHeight={0} url={`${codis_url}`} onSuccess={this.getCodisData} />
          <Fetch defaultHeight={0} url={`${user_url}`} onSuccess={this.getUserAuthData} />
          <Fetch defaultHeight={0} url={`${k8sp_url}`} onSuccess={this.getK8spData} />
          <Fetch defaultHeight={0} url={`${openstack_url}`} onSuccess={this.getOpenstackData} />
          */}
        </div>
      )
  }
})
