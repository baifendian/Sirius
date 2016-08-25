
const HdfsConf={
  //URL配置定义
  urlTempData:{
    Capacity:{
      SUM:"v1/hdfs///?op=SUM", //统计各个space配额
      UPSET:"v1/hdfs///?op=UPSET&space_name=${spaceName}" //给space扩容.
    },
    MyFile:{
      LIST_STATUS:"v1/hdfs/${relativePath}/?op=LISTSTATUS&spaceName=${spaceName}", //以表格结构获取文件列表(过滤掉回收站的数据)
      UPLOAD:"v1/hdfs/upload/${relativePath}/?type=http&space_name=${spaceName}", //文件上传
      LIST_STATUS_TREE:"v1/hdfs/${relativePath}/?op=LISTSTATUSTREE&spaceName=${spaceName}", //以树形结构获取文件夹
      DELETE:"v1/hdfs/${relativePath}/?op=DELETE&spaceName=${spaceName}", //删除目录
      COMPRESS:"v1/hdfs/${relativePath}/?op=COMPRESS&space_name=${spaceName}", //压缩目录
      SHARE:"v1/hdfs/${relativePath}/?permission=private&op=SHARE&Validity=10&space_name=${spaceName}",//分享目录
      DOWNLOAD:"v1/hdfs/${relativePath}/?type=http&op=DOWNLOAD&space_name=${spaceName}",//下载文件
      RENAME:"v1/hdfs/${relativePath}/?op=RENAME&destination=${targetPath}&space_name=${spaceName}", //移动目录
      MKDIRS:"v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${spaceName}", //创建目录
    },
    Service:{
      OPERATOR:"v1/hdfs/${hostName}/${componentName}/${operator}/", //服务启动或停止
      STATE:"v1/hdfs/state/",//获取状态
      COMPONENT_INFO:"v1/hdfs/relation/${hostname}/",//获取某台主机上面的组件信息
    },
    Share:{
      SHARE_GET:"v1/hdfs///?space_name=${spaceName}&op=SHARE", //获取分享信息
      SHARE_DELETE:"v1/hdfs///?op=SHARE&share_id=${shareId}", //删除分享
    },
    ShareCenter:{
      SHARE:"v1/hdfs///?space_name=${spaceName}&op=SHARE", //获取分享信息
    },
    ShowShare:{
      SHARE_LIST_STATUS:"v1/hdfs/share/${relativePath}/?shareId=${shareId}",//以列表形式获取某个分享下的文件或文件夹
      LIST_STATUS_TREE:"v1/hdfs///?op=LISTSTATUSTREE&spaceName=${spaceName}", //以树形结构获取文件夹
      DELETE:"v1/hdfs/${relativePath}/?op=DELETE&spaceName=${spaceName}", //删除目录
      RENAME:"v1/hdfs/${relativePath}/?op=RENAME&destination=${targetPath}&space_name=${spaceName}",//移动目录
      MKDIRS:"v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${this.props.cur_space}"//创建文件夹. 暂时不用.
    },
    Trash:{
      LIST_STATUS:"v1/hdfs/${relativePath}/?op=LISTSTATUS&spaceName=${spaceName}&isTrash=1",//获取回收站中的文件列表
      LIST_STATUS_TREE:"v1/hdfs///?op=LISTSTATUSTREE&spaceName=${spaceName}",//以树形结构获取文件夹
      DELETE:"v1/hdfs/${relativePath}/?op=DELETE&spaceName=${spaceName}", //删除目录
      RENAME:"v1/hdfs/${relativePath}/?op=RENAME&destination=${targetPath}&space_name=${spaceName}&isTrash=1",//从垃圾箱移出目录
      MKDIRS:"v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${spaceName}"//创建文件夹. 暂时不用.
    },
  },
  //获取URL配置.使用所有的模版的公共变量作为函数参数,里面可以直接渲染所有模版变量.
  getUrlData({moduleName='',type='',spaceName='',relativePath='',targetPath='',hostName='',componentName='',operator='',shareId=''}){
    let urlTemp = this.urlTempData[moduleName][type];
    let urlStr = `return \`${urlTemp}\``;
    let func = new Function("spaceName","relativePath","targetPath",
                            "hostName","componentName","operator",
                            "shareId",urlStr);
    let url = func(spaceName,relativePath,targetPath,
                   hostName,componentName,operator,shareId);
    console.log(`getUrlData: ${url}`);
    return url;
    /*
    let str = 'return ' + '`Hello ${name}!`';
    let func = new Function('name', str);
    func('Jack')
    */
  },
  //面包屑数据定义
  navigationData:{
    MyFile:{
      headText:"我的任务",
      navigationTexts:[{
        text:"我的任务",
        url:""
      }]
    },
    Service:{
      headText:"服务管理",
      navigationTexts:[{
        text:"服务管理",
        url:"",
      }]
    },
    Share:{
      headText:"我的分享",
      navigationTexts:[{
        text:"我的分享",
        url:""
      }]
    },
    ShareCenter:{
      headText:"共享中心",
      navigationTexts:[{
        text:"共享中心",
        url:""
      }]
    },
    Trash:{
      headText:"我的回收站",
      navigationTexts:[{
        text:"我的回收站",
        url:""
      }]
    },
    Capacity:{
      headText:"配额管理",
      navigationTexts:[{
        text:"配额管理",
        url:""
      }]
    }
  },
  //直接获取面包屑数据的接口
  getNavigationData(moduleName,type){
    //给navigationTexts增加一个概览
    let outLine = {text:"概览",url:""};
    if(type.toLocaleLowerCase() == "navigationtexts"){
      let navigationTexts = this.navigationData[moduleName][type];
      navigationTexts.unshift(outLine);
    }else{
      this.navigationData[moduleName][type];
    }
  },
}

export default HdfsConf;
