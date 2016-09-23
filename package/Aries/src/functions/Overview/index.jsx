import React from 'react'
import { Checkbox } from 'bfd/Checkbox'
import './index.less'
import { Row, Col } from 'bfd/Layout'
import auth from 'public/auth'
import OverviewConf from './OverviewConf'
import Fetch from 'bfd/Fetch'

export default React.createClass({
  getInitialState:function(){
    return {
        random: 0,
        hdfs_disk_used: 0, //HDFS使用百分比
        hdfs_shares: 0, //HDFS分享文件的个数
        hdfs_datanodes: "0/0", //HDFS datanode健康状态(99/100)
        codis_count: "0/0", //Codis 集群总个数(10/11,正常集群／总集群)
        codis_memory_used: 0, //Codis 内存使用率50%
        k8sp_pod_count: "0/0", //Pod个数(9/10)
        k8sp_rc_count: "0/0", //rc(9/10)
        k8sp_service_status_count: 0, //Service状态
        k8sp_nodes_count: 0, //Node个数
        bdms_running_count: 0, //今日正在运行的任务
        bdms_success_count: 0, //今日执行成功的任务
        bdms_failed_count: 0, //今日运行失败的任务
        bdms_task_count: 0, //今日总任务
        openstack_vm_count: "0/0", //虚拟机(9/10)
        openstack_image_count: 0, //镜像个数
        openstack_disk_count: 0, //云磁盘个数
        userAuth_member_count: 0, //当前space成员个数
    };
  },
  index:function(){
    let cur_space = auth.user.cur_space;
    let type = auth.user.type;
    if(cur_space== "" && type < 1){
      return <div>您还不属于任何space.请联系space管理员进行添加.</div>
    }
    if(cur_space== "" && type >0){
      return <div>您还没有创建任何space.请先创建space</div>
    }
    //展示
    let data = OverviewConf.overviewData;
    let overviewBody = data.map((component,index)=>{
      let title = component.title;
      let contentData = component.content;
      let contentComponent = contentData.map((d,i)=>{
        let value = d.value;
        return <Row key={i}>
                 <Col col="md-7" >{d.label}</Col>
                 <Col col="md-3" >{this.state[value]}</Col>
               </Row>
      });
      //全部组件的数据
      return <Col col="md-3" key={index}>
               <div className="common">
                 <div className="title">{title}</div>
                 <div className="content">
                   {contentComponent}
                 </div>
               </div>
            </Col>

    });
    return <Row gutter>{overviewBody}</Row>
  },
  refresh(){
    let random = parseInt(100000*Math.random())
    this.setState({random:random});
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
    let k8sp_service_status_count = `${data.service.count}/${data.service.total}`;
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
    this.setState({
      hdfs_disk_used: `${data.hdfs_disk_used.toFixed(2)*100} %`,
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

    //根据space获取对应的指标信息
    let conent = this.index();
    return (
        <div className="overview">
          {conent}
          <Fetch defaultHeight={0} url={`${bdms_url}`} onSuccess={this.getBdmsData} />
          <Fetch defaultHeight={0} url={`${hdfs_url}`} onSuccess={this.getHdfsData} />
          <Fetch defaultHeight={0} url={`${codis_url}`} onSuccess={this.getCodisData} />
          <Fetch defaultHeight={0} url={`${user_url}`} onSuccess={this.getUserAuthData} />
          <Fetch defaultHeight={0} url={`${k8sp_url}`} onSuccess={this.getK8spData} />
          {/*
          <Fetch defaultHeight={0} url={`${openstack_url}?random=${this.state.random}`} onSuccess={this.getOpenstackData} />
          */}
        </div>
      )
  }
})
