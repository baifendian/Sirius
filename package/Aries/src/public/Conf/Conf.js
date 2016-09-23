import auth from '../auth'
const conf = {
  //从location中获取cur_space
  getCurSpace(_this) {
    let cur_space = _this.props.location.query.cur_space;
    if (cur_space == undefined) {
      cur_space = auth.user.cur_space;
    }
    console.log(`cur_space: ${cur_space}`);
    return cur_space;
  },
  urlTempData: {
    //公共部分模版url模版
    COMMON: {
      Head: {
        SPACE_SWITCH: "v1/user_auth/user/${spaceName}/", //head部分的space切换
      },
    },
    //概览部分模版url模版
    Overview:{ //总览模块
      Overview:{ //总览页面
        HDFS_OVERVIEW: "v1/hdfs/overview/?spaceName=${spaceName}",
        BDMS_OVERVIEW: "k8s/api/v1/dashboard/taskinfo",
        K8SP_OVERVIEW: "k8s/api/v1/namespaces/(?P<${spaceName}>\w{1,64})/k8soverview",
        CODIS_OVERVIEW: "v1/codis/codisoverview/",
        USER_AUTH_OVERVIEW:"v1/user_auth/overview/?spaceName=${spaceName}",
        OPENSTACK_OVERVIEW:"openstack/home/overview/",
      }
    },
    //用户管理模块url模版
    UserAuth: {
      SpaceList: {
        SPACE_INFO: "v1/user_auth/spaces/info/${spaceId}/", //获取space信息 is_admin
        SPACE_CUR: "v1/user_auth/spaces/?filter=${spaceName}", //获取当前space
        SPACE_MEMBER: "v1/user_auth/spaces/member/${spaceId}/?inspace=2", //不属于当前space的人员信息
        SPACE_MEMBER_NO: "v1/user_auth/spaces/member/${spaceId}/", //属于当前space的人员信息
        SPACE_MEMBER_POST: "v1/user_auth/spaces/member/${spaceId}/", //添加成员
        SPACE_MEMBER_PUT: "v1/user_auth/spaces/member/${spaceId}/", //修改成员角色
        ROLE_LIST: "v1/user_auth/roles/", //获取角色列表
      },
    },
    //HDFS模块url模版
    HDFS: {
      Capacity: {
        SUM: "v1/hdfs///?op=SUM", //统计各个space配额
        UPSET: "v1/hdfs///?op=UPSET&spaceName=${spaceName}" //给space扩容.
      },
      MyFile: {
        LIST_STATUS: "v1/hdfs/${relativePath}/?op=LISTSTATUS&spaceName=${spaceName}", //以表格结构获取文件列表(过滤掉回收站的数据)
        UPLOAD: "v1/hdfs/upload/${relativePath}/?type=http&spaceName=${spaceName}", //文件上传
        LIST_STATUS_TREE: "v1/hdfs/${relativePath}/?op=LISTSTATUSTREE&spaceName=${spaceName}", //以树形结构获取文件夹
        DELETE: "v1/hdfs/${relativePath}/?op=DELETE&spaceName=${spaceName}", //删除目录
        COMPRESS: "v1/hdfs/${relativePath}/?op=COMPRESS&spaceName=${spaceName}", //压缩目录
        SHARE: "v1/hdfs/${relativePath}/?permission=private&op=SHARE&Validity=10&spaceName=${spaceName}", //分享目录
        DOWNLOAD: "/v1/hdfs/${relativePath}/?type=http&op=DOWNLOAD&spaceName=${spaceName}", //下载文件
        RENAME: "v1/hdfs/${relativePath}/?op=MV&destination=${targetPath}&spaceName=${spaceName}", //移动目录
        MKDIRS: "v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${spaceName}", //创建目录
      },
      Service: {
        OPERATOR: "v1/hdfs/${hostName}/${componentName}/${operator}/", //服务启动或停止
        STATE: "v1/hdfs/state/", //获取状态
        COMPONENT_INFO: "v1/hdfs/relation/${hostName}/", //获取某台主机上面的组件信息
        HOST_INFO: "v1/hdfs/hostinfo/${hostName}/", //获取某台机器的主机信息
      },
      Share: {
        SHARE_GET: "v1/hdfs///?spaceName=${spaceName}&op=SHARE", //获取分享信息
        SHARE_DELETE: "v1/hdfs///?op=SHARE&share_id=${shareId}", //删除分享
      },
      ShareCenter: {
        SHARE: "v1/hdfs///?spaceName=${spaceName}&op=SHARE", //获取分享信息
      },
      ShowShare: {
        SHARE_LIST_STATUS: "v1/hdfs/share/${relativePath}/?shareId=${shareId}", //以列表形式获取某个分享下的文件或文件夹
        LIST_STATUS_TREE: "v1/hdfs/${relativePath}/?op=LISTSTATUSTREE&spaceName=${spaceName}", //以树形结构获取文件夹
        DELETE: "v1/hdfs/${relativePath}/?op=DELETE&shareId=${shareId}&filter=share&spaceName=${spaceName}", //删除目录
        RENAME: "v1/hdfs/${relativePath}/?op=CP&destination=${targetPath}&filter=share&shareId=${shareId}&spaceName=${spaceName}", //移动目录
        MKDIRS: "v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${spaceName}" //创建文件夹. 暂时不用.
      },
      Trash: {
        LIST_STATUS: "v1/hdfs/${relativePath}/?op=LISTSTATUS&spaceName=${spaceName}&filter=trash", //获取回收站中的文件列表
        LIST_STATUS_TREE: "v1/hdfs/${relativePath}/?op=LISTSTATUSTREE&spaceName=${spaceName}", //以树形结构获取文件夹
        DELETE: "v1/hdfs/${relativePath}/?op=DELETE&spaceName=${spacessName}&filter=trash", //删除目录
        RENAME: "v1/hdfs/${relativePath}/?op=MV&destination=${targetPath}&spaceName=${spaceName}&filter=trash", //从垃圾箱移出目录
        MKDIRS: "v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${spaceName}" //创建文件夹. 暂时不用.
      },
    },
  },
  //获取URL配置.使用所有的模版的公共变量作为函数参数,里面可以直接渲染所有模版变量.
  getUrlData({
    moduleName = '',
    pageName = '',
    type = '',
    spaceName = '',
    relativePath = '',
    targetPath = '',
    hostName = '',
    componentName = '',
    operator = '',
    shareId = '',
    spaceId = '',
  }) {
    let urlTemp = this.urlTempData[moduleName][pageName][type];
    let urlStr = `return \`${urlTemp}\``;
    let func = new Function("spaceName", "relativePath", "targetPath",
      "hostName", "componentName", "operator",
      "shareId", "spaceId", urlStr);
    let url = func(spaceName, relativePath, targetPath,
      hostName, componentName, operator, shareId,
      spaceId
    );
    console.log(`getUrlData: ${url}`);
    return url;
  },
  navigationData: {
    //HDFS面包屑数据配置
    HDFS: {
      Base: {
        headText: "",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云服务",
          url: ""
        }, {
          text: "HDFS云",
          url: ""
        }]
      },
      MyFile: {
        headText: "我的文件",
        navigationTexts: [{
          text: "我的文件",
          url: "/CloudService/HDFS/Myfile?cur_space=${spaceName}"
        }]
      },
      Service: {
        headText: "服务管理",
        navigationTexts: [{
          text: "服务管理",
          url: "/CloudService/HDFS/Service?cur_space=${spaceName}",
        }]
      },
      Share: {
        headText: "我的分享",
        navigationTexts: [{
          text: "我的分享",
          url: "/CloudService/HDFS/Share?cur_space=${spaceName}"
        }]
      },
      ShareCenter: {
        headText: "共享中心",
        navigationTexts: [{
          text: "共享中心",
          url: "/CloudService/HDFS/ShareCenter?cur_space=${spaceName}"
        }]
      },
      Trash: {
        headText: "我的回收站",
        navigationTexts: [{
          text: "我的回收站",
          url: "/CloudService/HDFS/Trash?cur_space=${spaceName}"
        }]
      },
      Capacity: {
        headText: "配额管理",
        navigationTexts: [{
          text: "配额管理",
          url: "/CloudService/HDFS/Capacity?cur_space=${spaceName}"
        }]
      }
    },
    //用户管理面包屑配置
    UserAuth: {
      Base: {
        headText: "",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }]
      },
      SpaceList: {
        headText: "space管理",
        navigationTexts: [{
          text: "space列表",
          url: "/UserAuth/SpaceList?cur_space=${spaceName}"
        }]
      },
    },
    //Codis 面包屑
    Codis: {
      Base: {
        headText: "",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云服务",
          url: ""
        }, {
          text: "Codis云",
          url: ""
        }]
      },
      CodisInfo: {
        headText: "Codis信息",
        navigationTexts: [{
          text: "Codis信息",
          url: "/CloudService/Codis/CodisInfo?cur_space=${spaceName}"
        }]
      },
      HostInfo: {
        headText: "主机信息",
        navigationTexts: [{
          text: "主机信息",
          url: "/CloudService/Codis/HostInfo?cur_space=${spaceName}"
        }]
      },
    },
    //openstack Instances面包屑
    Instances:{
      Base: {
        headText: "",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云主机",
          url: ""
        }, {
          text: "计算",
          url: ""
        }]
      },
      instances: {
        headText: "虚拟机",
        navigationTexts: [{
          text: "虚拟机",
          url: "/CloudHost/Calculation/Instances?cur_space=${spaceName}"
        }]
      },
      image: {
        headText: "镜像",
        navigationTexts: [{
          text: "镜像",
          url: "/CloudHost/Calculation/Images?cur_space=${spaceName}"
        }]
      },
      flavors: {
        headText: "类型",
        navigationTexts: [{
          text: "类型",
          url: "/CloudHost/Calculation/Flavors?cur_space=${spaceName}"
        }]
      },
    },
    //openstack Volumes面包屑
    Volumes:{
      Base: {
        headText: "12",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云主机",
          url: ""
        }, {
          text: "存储",
          url: ""
        }]
      },
      volumes: {
        headText: "云磁盘",
        navigationTexts: [{
          text: "云磁盘",
          url: "/CloudHost/Storage/Volumes?cur_space=${spaceName}"
        }]
      },
      backup: {
        headText: "备份",
        navigationTexts: [{
          text: "备份",
          url: "/CloudHost/Storage/Backup?cur_space=${spaceName}"
        }]
      },
    },
    //openstack Project面包屑
    Project:{
      Base: {
        headText: "11",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云主机",
          url: ""
        }, {
          text: "管理",
          url: ""
        }]
      },
      project: {
        headText: "项目管理",
        navigationTexts: [{
          text: "项目管理",
          url: "/CloudHost/Manage/Project?cur_space=${spaceName}"
        }]
      },
    },
    //计算管理面包屑
    K8sMonitor: {
      Base: {
        headText: "",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云容器",
          url: ""
        }, {
          text: "k8s相关监控",
          url: ""
        }]
      },
      Overview: {
        headText: "K8s监控概览",
        navigationTexts: [{
          text: "K8s监控概览",
          url: "/CloudContainer/CalcManage/Overview?cur_space=${spaceName}"
        }]
      },
      PodInfo: {
        headText: "Pod信息",
        navigationTexts: [{
          text: "Pod信息",
          url: "/CloudContainer/CalcManage/PodInfo?cur_space=${spaceName}"
        }]
      },
      ServiceInfo: {
        headText: "Service信息",
        navigationTexts: [{
          text: "Service信息",
          url: "/CloudContainer/CalcManage/ServiceInfo?cur_space=${spaceName}"
        }]
      },
      ReplicationControllerInfo: {
        headText: "RC信息",
        navigationTexts: [{
          text: "RC信息",
          url: "/CloudContainer/CalcManage/ReplicationControllerInfo?cur_space=${spaceName}"
        }]
      },
      IngressInfo: {
        headText: "Ingress信息",
        navigationTexts: [{
          text: "Ingress信息",
          url: "/CloudContainer/CalcManage/IngressInfo?cur_space=${spaceName}"
        }]
      },
    },
    UserDoc: {
      Base: {
        headText: "",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云容器",
          url: ""
        }, {
          text: "使用说明",
          url: ""
        }]
      },
      CC1: {
        headText: "开始使用",
        navigationTexts: [{
          text: "开始使用",
          url: "/CloudContainer/UserDoc/CC1?cur_space=${spaceName}"
        }]
      },
      CC2: {
        headText: "云中心计算集群",
        navigationTexts: [{
          text: "云中心计算集群",
          url: "/CloudContainer/UserDoc/CC2?cur_space=${spaceName}"
        }]
      }
    },
    OffLineCalcTask: {
      Base: {
        headText: "",
        navigationTexts: [{
          text: "概览",
          url: "/?cur_space=${spaceName}"
        }, {
          text: "云容器",
          url: ""
        }, {
          text: "离线计算任务",
          url: ""
        }]
      },
      MyTask: {
        headText: "我的任务",
        navigationTexts: [{
          text: "我的任务",
          url: "/CloudContainer/OffLineCalcTask/MyTask?cur_space=${spaceName}"
        }]
      }
    }
  },
  //公共获取面包屑数据的接口
  getNavigationData({
    moduleName = "",
    pageName = "",
    type = "",
    spaceName = ""
  }) {
    if (type.toLocaleLowerCase() == "navigationtexts") {
      //获取Base中的公共导航
      let navigationTextBase = this.navigationData[moduleName]["Base"][type]
      let navigationTextExtend = this.navigationData[moduleName][pageName][type];
      //增加Base中的模块.
      let navigationTextTemp = [].concat(navigationTextBase, navigationTextExtend);
      //替换模版中的spaceName
      let navigationTexts = navigationTextTemp.map(function(navigationText, index) {
        let urlTemp = navigationText.url;
        let urlStr = `return \`${urlTemp}\``;
        let func = new Function("spaceName", urlStr);
        let url = func(spaceName);
        navigationText.url = url;
        return navigationText;
      });
      navigationTextTemp.shift();
      return navigationTexts;
    } else {
      return this.navigationData[moduleName][pageName][type];
    }
  },

}
export default conf;
