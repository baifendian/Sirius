import conf from 'public/Conf/Conf'
const Openstackconf={
  //从location中获取cur_space
  getCurSpace(_this){
    return conf.getCurSpace(_this);
  },
  //直接获取面包屑数据的接口
  getNavigationData({moduleName="Instances",pageName="",type="",spaceName=""}){
    return conf.getNavigationData({ moduleName : moduleName, pageName : pageName,
                                    type : type, spaceName : spaceName});
  },
  getNavigationDatav({moduleName="Volumes",pageName="",type="",spaceName=""}){
    return conf.getNavigationData({ moduleName : moduleName, pageName : pageName,
                                    type : type, spaceName : spaceName});
  },
  getNavigationDatap({moduleName="Project",pageName="",type="",spaceName=""}){
    return conf.getNavigationData({ moduleName : moduleName, pageName : pageName,
                                    type : type, spaceName : spaceName});
  },
}

export default Openstackconf;
