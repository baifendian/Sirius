const UserAuthConf = {
    urlTempData:{
        SpaceList:{
            SPACE_INFO:"v1/user_auth/spaces/info/${spaceName}/",//获取space信息
            SPACE_CUR:"v1/user_auth/spaces/?filter=${filter}", //获取当前space
            SPACE_MEMBER:"v1/user_auth/spaces/member/${spaceName}/?inspace=2",//获取SPACE成员信息
            SPACE_MEMBER_NO:"v1/user_auth/spaces/member/${spaceName}/",
            SPACE_MEMBER_POST:"v1/user_auth/spaces/member/${spaceId}/",//添加成员
            SPACE_MEMBER_PUT:"v1/user_auth/spaces/member/${spaceId}/", //修改成员角色
        },
    },
    //获取URL配置
    getUrlData({moduleName="",type="",spaceName="",spaceId="",filter=""}){
      let urlTemp = this.urlTempData[moduleName][type];
      let urlStr = `return \`${urlTemp}\``;
      let func = new Function("spaceName","spaceId","filter",urlStr);
      let url = func(spaceName,spaceId,filter);
      console.log(`getUrlData: ${url}`);
      return url;
    },
    //面包屑数据定义
    navigationData:{
      SpaceList:{
          headText:"space管理",
          navigationTexts:[{
              text:"space列表",
              url:""
          }]
      },
    },
    //直接获取面包屑数据的接口
    getNavigationData(moduleName,type){
      let outLine = {text:"概览",url:""};
      if(type.toLocaleLowerCase() == "navigationtexts" ){
        let navigationTexts = this.navigationData[moduleName][type];
        navigationTexts.unshift(outLine);
        return navigationTexts;
      }else{
        this.navigationData[moduleName][type];
      }
    },
}

export default UserAuthConf;
