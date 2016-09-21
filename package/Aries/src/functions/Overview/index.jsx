import React from 'react'
import { Checkbox } from 'bfd/Checkbox'
import './index.less'
import { Row, Col } from 'bfd/Layout'
import auth from 'public/auth'
import ReactInterval from 'react-interval'

export default React.createClass({
  getInitialState:function(){
    return {
        random: 0,
        hdfs_disk_used: 0, //HDFS使用百分比
        hdfs_shares: 0, //HDFS分享文件的个数
        hdfs_datanodes: 0, //HDFS datanode健康状态(99/100)
        codis_count: 0, //Codis 集群总个数(10/11,正常集群／总集群)
        codis_memory_used: 0, //Codis 内存使用率50%
        k8sp_pod_count: 0, //Pod个数(9/10)
        k8sp_rc_count: 0, //rc(9/10)
        k8sp_service_status_count: 0, //Service状态
        k8sp_nodes_count: 0, //Node个数
        bdms_running_count: 0, //今日正在运行的任务
        bdms_success_count: 0, //今日执行成功的任务
        bdms_failed_count: 0, //今日运行失败的任务
        bdms_task_count: 0, //今日总任务
        openstack_vm_count: 0, //虚拟机(9/10)
        openstack_image_count: 0, //镜像个数
        openstack_disk_count: 0, //云磁盘个数
        userAuth_member_count: 0, //当前space成员个数
    };
  },
  index:()=>{
    let cur_space = auth.user.cur_space;
    let type = auth.user.type;
    if(cur_space== "" && type < 1){
      return <div>您还不属于任何space.请联系space管理员进行添加.</div>
    }
    if(cur_space== "" && type >0){
      return <div>您还没有创建任何space.请先创建space</div>
    }
    //展示概览信息
    return <Row gutter>
              <Col col="md-3">
                <div className="common">
                  <div className="title">HDFS</div>
                  <div className="content">
                    <Row>
                      <Col col="md-4" >使用百分比:</Col>
                      <Col col="md-6" >0 %</Col>
                    </Row>
                  </div>
                </div>
              </Col>
              <Col col="md-3">
                <div className="common">
                  <div className="title">codis</div>
                  <div className="content">
                      codis
                  </div>
                </div>
              </Col>
              <Col col="md-4">
                <div className="common">
                  <div className="title">k8sp</div>
                  <div className="content">aaaa</div>
                </div>
              </Col>
              <Col col="md-5">
                <div className="common">
                  <div className="title">BDMS</div>
                  <div className="content">aaaa</div>
                </div>
              </Col>
              <Col col="md-5">
                <div className="common">
                  <div className="title">openstack</div>
                  <div className="content">aaaa</div>
                </div>
              </Col>
          </Row>


  },
  refresh(){
    let random = parseInt(100000*Math.random())
    this.setState({random:random});
    console.log(random);
  },
  render() {
      //根据space获取对应的指标信息
      let conent = this.index();
      console.log(`random: ${this.state.random}`);
      return (
          <div className="overview">
            {conent}
            <ReactInterval timeout={1000} enabled={true}
            callback={this.refresh} />
          </div>

        )
  }
})
