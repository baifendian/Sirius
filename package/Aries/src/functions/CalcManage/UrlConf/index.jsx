import conf from 'public/Conf/Conf'
const CalcManageConf={
  //从location中获取cur_space
  getCurSpace(_this){
    return conf.getCurSpace(_this);
  },
  //获取URL配置.使用所有的模版的公共变量作为函数参数,里面可以直接渲染所有模版变量.
  getUrlData({moduleName="HDFS",pageName='',type='',spaceName='',relativePath='',targetPath='',hostName='',componentName='',operator='',shareId=''}){
    /*
    let str = 'return ' + '`Hello ${name}!`';
    let func = new Function('name', str);
    func('Jack')
    */
    return conf.getUrlData({ moduleName : moduleName, pageName : pageName, type : type,
                             spaceName : spaceName, relativePath : relativePath, targetPath : targetPath,
                             hostName : hostName, componentName : componentName, operator : operator,
                             shareId : shareId
                            });
  },
  //直接获取面包屑数据的接口
  getNavigationData({moduleName="CalcManage",pageName="",type="",spaceName=""}){
    return conf.getNavigationData({ moduleName : moduleName, pageName : pageName,
                                    type : type, spaceName : spaceName});
  },
}

export default CalcManageConf;
