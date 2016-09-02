import conf from 'public/Conf/Conf'
const CodisConf={
  //从location中获取cur_space
  getCurSpace(_this){
    return conf.getCurSpace(_this);
  },
  //直接获取面包屑数据的接口
  getNavigationData({moduleName="Codis",pageName="",type="",spaceName=""}){
    return conf.getNavigationData({ moduleName : moduleName, pageName : pageName,
                                    type : type, spaceName : spaceName});
  },
}

export default CodisConf;
