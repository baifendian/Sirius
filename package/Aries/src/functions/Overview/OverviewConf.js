import conf from 'public/Conf/Conf'
const OverviewConf={
  //概览基础数据
  overviewData:[{
    title:"HDFS",
    content: [
              {label:"使用百分比:",value:"hdfs_disk_used"},
              {label:"分享个数:",value:"hdfs_shares"},
              {label:"datanode健康状态:",value:"hdfs_datanodes"}
             ]
    },{
      title:"CODIS",
      content: [
                {label:"codis集群总数:",value:"codis_count"},
                {label:"codis内存使用率:",value:"codis_memory_used"},
               ]
    },{
      title:"K8SP",
      content: [
                {label:"pod个数:",value:"k8sp_pod_count"},
                {label:"rc个数:",value:"k8sp_rc_count"},
                {label:"service状态:",value:"k8sp_service_status_count"},
                {label:"node个数:",value:"k8sp_nodes_count"}
               ]
    },{
      title:"BDMS",
      content: [
                {label:"今日正在运行的任务:",value:"bdms_running_count"},
                {label:"今日执行成功的任务:",value:"bdms_success_count"},
                {label:"今日运行失败的任务:",value:"bdms_failed_count"},
                {label:"今日总任务:",value:"bdms_task_count"}
               ]
    },{
      title:"OPENSTACK",
      content: [
                {label:"虚拟机:",value:"openstack_vm_count"},
                {label:"镜像个数:",value:"openstack_image_count"},
                {label:"云磁盘个数:",value:"openstack_disk_count"}
               ]
    },{
      title:"用户",
      content: [
        {label:"当前space成员个数:",value:"userAuth_member_count"},
      ]
    }],
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
