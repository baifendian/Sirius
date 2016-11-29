const common = {
  /*
   * 替换单个模版字符串
   * demo:
   *   params:
   *   temp: {id:1,name:{ n1:"${args.t1}", n2:{nn2:"${args.date.month}",nn3:"${args.date.day}"}}}
   *   args: {t1:1,date:{ month:2, day:3}}
   * result: {id:1,name:{ n1:1, n2:{nn2:2,nn3:3}}
   *
   */
  tempVariReplace(jsonValue, args){
    let reg = /\${[\w|.]+}/g;
    //只替换字符串模版
    let tempVari = typeof(jsonValue) == "string" ? jsonValue.match(reg): null;
    tempVari != null && tempVari.forEach((tempVariName,index)=>{
      debugger;
      //模版变量变量名
      let regStr = `/\\${tempVariName}/g`;
      let reg = eval(regStr);
      //模版变量变量值
      let name = /\${([\w|.]+)}/.exec(tempVariName)[1];
      let names =name.split(".");
      let tempVarValue = common.getObjectAttr(names,args);
      jsonValue = jsonValue.replace(reg, JSON.stringify(tempVarValue));
    })
    try{
      jsonValue = JSON.parse(jsonValue);
    }catch(err){
      console.log(`${jsonValue} is not object`);
    }
    return jsonValue;
  },
  tempPreHandler(temp,args){
    if(typeof(temp) != "object"){
      //替换字符串中的变量
      temp = common.tempVariReplace(temp, args);
      return temp;
    }
    //遍历args对象,找到模版变量,然后直接替换模版变量 "${item}"
    Object.keys(temp).forEach(function(item, index){
      let jsonValue = temp[item];
      if(typeof(jsonValue) == "object"){
        temp[item] = common.tempPreHandler(jsonValue,args);
      }else{
        temp[item] = common.tempVariReplace(jsonValue,args);
        return temp
      }
    });
    return temp;
  },
  getObjectAttr(arr, obj){
    let value = obj;
    //获取obj的属性对应的值,属性可以是多个层级
    if( typeof(obj) != "object"){
      return value;
    }
    arr.forEach((item,index)=>{
      value = value[item];
    });
    return value;
  }
}

export default common;
