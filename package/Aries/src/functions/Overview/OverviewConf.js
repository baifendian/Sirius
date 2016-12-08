import conf from 'public/Conf/Conf'
const OverviewConf={
  //概览基础数据定义
  getOverviewData(){
    return [{
      title: "HDFS",
      id: "hdfs",
      content: [
                  {
                    name: "HDFS使用率",
                    stateName: "hdfs_disk",
                    value: {
                      used: "${used}",
                      nonUsed: "${nonUsed}"
                    },
                    type: "pie",
                    desc: "已使用: ${used} ${unit}<br/>\
                           剩余: ${nonUsed} ${unit}<br/>\
                           总共: ${total} ${unit}"
                  },
                  {
                    name: "HDFS分享个数",
                    value: "${hdfs_shares}",
                    stateName: "hdfs_shares",
                    desc: "${hdfs_shares} 个目录被分享."
                  },
                  {
                    name: "DN存活状态",
                    stateName: "hdfs_datanodes",
                    value: "${lives} / ${total}",
                    desc: "健康: ${lives}<br/>异常: ${dead}"
                  }
               ]
      },{
        title: "CODIS",
        id: "codis",
        content: [
                  {
                    name: "Codis 集群",
                    stateName: "codis_cluster",
                    value: "${lives} / ${total}",
                    desc: "正常: ${lives}<br/>\
                           异常: ${dead}"
                  },
                  {
                    name: "Codis 内存使用率",
                    stateName: "codis_memory",
                    value: {
                      used: "${used}",
                      nonUsed: "${nonUsed}"
                    },
                    type: "pie",
                    desc: "已使用: ${used} ${unit}<br/>\
                           剩余: ${nonUsed} ${unit}<br/>\
                           总共: ${total} ${unit}"
                  },
                 ]
      },{
        title: "K8SP",
        id: "k8s",
        content: [
                  {
                    name: "Pod个数",
                    stateName: "k8sp_pod",
                    value: "${lives} / ${total}",
                    desc: "正常: ${lives}<br/>异常: ${dead}"
                  },
                  {
                    name: "RC个数",
                    stateName: "k8sp_rc",
                    value: "${current} / ${desired}",
                    desc: "当前: ${current}<br/>预期: ${desired}"
                  },
                  {
                    name: "Service状态",
                    stateName: "k8sp_service",
                    value: "${k8sp_service}",
                    desc: "${k8sp_service} 状态."
                  },
                  {
                    name: "Node个数",
                    stateName: "k8sp_nodes",
                    value: "${lives} / ${total}",
                    desc: "正常: ${lives}<br/>异常: ${dead}"
                  }
                 ]
      },{
        title: "OPENSTACK",
        id: "openstack",
        content: [
                  {
                    name: "虚拟机状态",
                    stateName: "openstack_vm",
                    value: "${lives} / ${total}",
                    desc: "正常: ${lives}<br/>异常: ${dead}",
                  },
                  {
                    name: "镜像个数",
                    stateName: "openstack_image",
                    value: "${openstack_image}",
                    desc: "共保存了 ${openstack_image} 个镜像"
                  },
                  {
                    name: "云硬盘个数",
                    stateName: "openstack_disk",
                    value: "${openstack_disk}",
                    desc: "共分配了 ${openstack_disk} 个磁盘"
                  }
                 ]
      },{
        title: "用户",
        id: "user",
        content: [
          {
            name: "成员个数",
            stateName: "userAuth_member",
            value: "${userAuth_member}",
            desc: "当前空间共有 ${userAuth_member} 人"
          },
        ]
      }]
  },
  //从location中获取cur_space
  getCurSpace(_this){
    return conf.getCurSpace(_this);
  },
  //获取URL配置.使用所有的模版的公共变量作为函数参数,里面可以直接渲染所有模版变量.
  getUrlData({moduleName="Overview",pageName='Overview',type='',spaceName='',random=0}){
    return conf.getUrlData({ moduleName : moduleName, pageName : pageName, type : type,
                             spaceName : spaceName,random:random
                            });

  }
}

export default OverviewConf;
