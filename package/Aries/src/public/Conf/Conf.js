import auth from '../auth'
const conf={
  //从location中获取cur_space
  getCurSpace(_this){
    let cur_space = _this.props.location.query.cur_space;
    if(cur_space == undefined){
      cur_space = auth.user.cur_space;
    }
    console.log(`cur_space: ${cur_space}`);
    return cur_space;
  },
  urlTempData:{
    //公共部分模版url模版
    COMMON:{
      Head:{
        SPACE_SWITCH:"v1/user_auth/user/${spaceName}/", //head部分的space切换
      },
    },
    //用户管理模块url模版
    UserAuth:{
      SpaceList:{
        SPACE_INFO:"v1/user_auth/spaces/info/${spaceId}/",//获取space信息 is_admin
        SPACE_CUR:"v1/user_auth/spaces/?filter=${spaceName}", //获取当前space
        SPACE_MEMBER:"v1/user_auth/spaces/member/${spaceId}/?inspace=2",//不属于当前space的人员信息
        SPACE_MEMBER_NO:"v1/user_auth/spaces/member/${spaceId}/", //属于当前space的人员信息
        SPACE_MEMBER_POST:"v1/user_auth/spaces/member/${spaceId}/",//添加成员
        SPACE_MEMBER_PUT:"v1/user_auth/spaces/member/${spaceId}/", //修改成员角色
      },
    },
    //HDFS模块url模版
    HDFS:{
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
        COMPONENT_INFO:"v1/hdfs/relation/${hostName}/",//获取某台主机上面的组件信息
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
        LIST_STATUS_TREE:"v1/hdfs/${relativePath}/?op=LISTSTATUSTREE&spaceName=${spaceName}", //以树形结构获取文件夹
        DELETE:"v1/hdfs/${relativePath}/?op=DELETE&spaceName=${spaceName}", //删除目录
        RENAME:"v1/hdfs/${relativePath}/?op=RENAME&destination=${targetPath}&space_name=${spaceName}",//移动目录
        MKDIRS:"v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${this.props.cur_space}"//创建文件夹. 暂时不用.
      },
      Trash:{
        LIST_STATUS:"v1/hdfs/${relativePath}/?op=LISTSTATUS&spaceName=${spaceName}&isTrash=1",//获取回收站中的文件列表
        LIST_STATUS_TREE:"v1/hdfs/${relativePath}/?op=LISTSTATUSTREE&spaceName=${spaceName}",//以树形结构获取文件夹
        DELETE:"v1/hdfs/${relativePath}/?op=DELETE&spaceName=${spaceName}", //删除目录
        RENAME:"v1/hdfs/${relativePath}/?op=RENAME&destination=${targetPath}&space_name=${spaceName}&isTrash=1",//从垃圾箱移出目录
        MKDIRS:"v1/hdfs/${relativePath}/?op=MKDIRS&spaceName=${spaceName}"//创建文件夹. 暂时不用.
      },
    },
  },
  //获取URL配置.使用所有的模版的公共变量作为函数参数,里面可以直接渲染所有模版变量.
  getUrlData({ moduleName = '',pageName = '',type = '',spaceName = '',relativePath = '',
               targetPath = '',hostName = '',componentName = '',operator = '',shareId = '',
               spaceId = '',
             }){
    let urlTemp = this.urlTempData[moduleName][pageName][type];
    let urlStr = `return \`${urlTemp}\``;
    let func = new Function("spaceName","relativePath","targetPath",
                            "hostName","componentName","operator",
                            "shareId","spaceId",urlStr);
    let url = func(spaceName,relativePath,targetPath,
                   hostName,componentName,operator,shareId,
                   spaceId
                  );
    console.log(`getUrlData: ${url}`);
    return url;
  },
  navigationData:{
    //HDFS面包屑数据配置
    HDFS:{
      MyFile:{
        headText:"我的文件",
        navigationTexts:[{
          text:"我的文件",
          url:"/HDFS/Myfile?cur_space=${spaceName}"
        }]
      },
      Service:{
        headText:"服务管理",
        navigationTexts:[{
          text:"服务管理",
          url:"/HDFS/Service?cur_space=${spaceName}",
        }]
      },
      Share:{
        headText:"我的分享",
        navigationTexts:[{
          text:"我的分享",
          url:"/HDFS/Share?cur_space=${spaceName}"
        }]
      },
      ShareCenter:{
        headText:"共享中心",
        navigationTexts:[{
          text:"共享中心",
          url:"/HDFS/ShareCenter?cur_space=${spaceName}"
        }]
      },
      Trash:{
        headText:"我的回收站",
        navigationTexts:[{
          text:"我的回收站",
          url:"/HDFS/Trash?cur_space=${spaceName}"
        }]
      },
      Capacity:{
        headText:"配额管理",
        navigationTexts:[{
          text:"配额管理",
          url:"/HDFS/Capacity?cur_space=${spaceName}"
        }]
      }
    },
    //用户管理面包屑配置
    UserAuth:{
      SpaceList:{
          headText:"space管理",
          navigationTexts:[{
              text:"space列表",
              url:"/UserAuth/SpaceList?cur_space=${spaceName}"
          }]
      },
    }
  },
  //公共获取面包屑数据的接口
  getNavigationData({moduleName="",pageName="",type="",spaceName=""}){
    //给navigationTexts增加一个公用的概览
    let outLine = {text:"概览",url:"/?cur_space=${spaceName}"};
    if(type.toLocaleLowerCase() == "navigationtexts"){
      let navigationTextTemp = this.navigationData[moduleName][pageName][type];
      navigationTextTemp.unshift(outLine);
      //替换模版中的spaceName
      let navigationTexts = navigationTextTemp.map(function(navigationText,index){
         let urlTemp = navigationText.url;
         let urlStr = `return \`${urlTemp}\``;
         let func = new Function("spaceName",urlStr);
         let url = func(spaceName);
         navigationText.url = url;
         return navigationText;
      });
      navigationTextTemp.shift();
      return navigationTexts;
    }else{
      return this.navigationData[moduleName][pageName][type];
    }
  },

}
export default conf;
