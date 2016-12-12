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
    this.echartsMapping = {};
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
          used: 0,
          nonUsed: 1,
          unit: "GB",
          total: 1
        },
        k8sp_pod: {
          lives: 0,
          dead: 0,
          total: 0
        },
        k8sp_rc: {
          current: 0,
          desired: 0,
        },
        k8sp_service: {
          count: 0
        }, //Service状态
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
    let data = OverviewConf.getOverviewData();
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
    console.log(this);
    //从模版中取数据渲染
    let data = OverviewConf.getOverviewData();
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
          let stateName = item.stateName
          //存储echarts对象和指标的映射关系.方便后面的实时数据更新
          let echart =  echarts.init(document.getElementById(id));
          echart.setOption(option);
          this.echartsMapping[stateName] = echart;
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
  getConfItem(stateName){
    let itemData = null;
    OverviewConf.getOverviewData().forEach(function(item,index){
      let content = item.content;
      content.forEach(function(arr,index){
        if(arr.stateName == stateName){
          itemData = arr;
        }
      });
    })
    return itemData;
  },
  /*
   * 刷新 Echarts 图表数据
   */
  reloadEcharts(stateName,data){
    let item = this.getConfItem(stateName);
    if(item == null){
      console.log(`未知的stateName:${stateName}`);
      return ;
    }
    let type = item.type;
    let value = common.tempPreHandler(item.value,data);
    let echartsData = EchartsUtil.renderOptionData(type,value);
    let echart = this.echartsMapping[stateName];
    echart.setOption(echartsData);
  },
  getBdmsData(data){
    data["total"] = data.running + data.waiting + data.failed + data.success;
    this.setState({ bdms_task: data});
    this.reloadEcharts("bdms_task",data);
  },
  getK8spData(data){
    let k8sp_pod = data.k8sp_pod;
    k8sp_pod["total"] = k8sp_pod.lives + k8sp_pod.dead;
    let k8sp_nodes = data.k8sp_nodes;
    k8sp_nodes["total"] = k8sp_nodes.lives + k8sp_nodes.dead;
    this.setState({ k8sp_rc: data.k8sp_rc,
                    k8sp_pod: k8sp_pod,
                    k8sp_nodes: k8sp_nodes,
                    k8sp_service: data.k8sp_service
                  });
  },
  getCodisData(data){
    let codis_memory = data.codis_memory;
    let codis_cluster = data.codis_cluster;
    codis_cluster["total"] = codis_cluster.lives + codis_cluster.dead;
    codis_memory["total"] = codis_memory.used + codis_memory.nonUsed;
    this.setState({ codis_cluster: codis_cluster,
                    codis_memory: codis_memory
    });
    this.reloadEcharts("codis_memory",codis_memory);
  },
  getOpenstackData(data){
    let openstack_vm = data.openstack_vm;
    openstack_vm["total"] = openstack_vm.lives + openstack_vm.dead;
    this.setState({ openstack_disk: data.openstack_disk,
                    openstack_image: data.openstack_image,
                    openstack_vm: data.openstack_vm
    });
  },
  getHdfsData(data){
    let hdfs_disk = data.hdfs_disk;
    let hdfs_datanodes = data.hdfs_datanodes;
    hdfs_datanodes["total"] = hdfs_datanodes.lives + hdfs_datanodes.dead;
    hdfs_disk["total"] = hdfs_disk.used + hdfs_disk.nonUsed;
    this.setState({ hdfs_datanodes: hdfs_datanodes,
                    hdfs_disk: hdfs_disk,
                    hdfs_shares: data.hdfs_shares
    });
    this.reloadEcharts("hdfs_disk",hdfs_disk);
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
    let content = this.index();
    return (
        <div className="overview">
          {content}
          <Fetch defaultHeight={0} url={`${hdfs_url}`} onSuccess={this.getHdfsData} />
          <Fetch defaultHeight={0} url={`${user_url}`} onSuccess={this.getUserAuthData} />
          <Fetch defaultHeight={0} url={`${codis_url}`} onSuccess={this.getCodisData} />
          <Fetch defaultHeight={0} url={`${k8sp_url}`} onSuccess={this.getK8spData} />
          <Fetch defaultHeight={0} url={`${openstack_url}`} onSuccess={this.getOpenstackData} />
        </div>
      )
  }
})
