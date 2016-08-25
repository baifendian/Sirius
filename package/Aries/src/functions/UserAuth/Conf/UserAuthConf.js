import conf from 'public/Conf/Conf'
const UserAuthConf = {
    //从location中获取cur_space
    getCurSpace(_this){
      return conf.getCurSpace(_this);
    },
    //获取URL配置
    getUrlData({moduleName="UserAuth",pageName="",type="",spaceName="",spaceId=""}){
      return conf.getUrlData({ moduleName : moduleName, pageName : pageName, type : type,
                               spaceName : spaceName, spaceId : spaceId
                             });
    },
    //直接获取面包屑数据的接口使用hdfs里面的即可
    getNavigationData({moduleName="UserAuth",pageName="",type="",spaceName=""}){
      return conf.getNavigationData({ moduleName : moduleName, pageName : pageName,
                                      type : type, spaceName : spaceName});
    }
}

export default UserAuthConf;
