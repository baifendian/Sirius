const common = {
  /*
   * 递归替换 json(or string) 对象的每个value中的模版变量.
   * 示例:
   *   temp: {id:1,name:{n1:"${t1}", n2:{nn2:"${date.month}",nn3:"${date.day}"}}}
   *   args: {t1:1,date:{month:2, day:3}}
   * 返回: {id:1,name:{ n1:1, n2:{nn2:2,nn3:3}}
   *
   */
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
  /*
   * 替换单个模版字符串
   *  示例
   *   jsonValue : "abc_${date.month}"
   *   args: {date:{ month:1}}
   *  返回: "abc_1"
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
  /*
   * 取出 json 中 指定属性的值
   * 示例
   *   arr:  ["date","month"]
   *   obj:  {"date":{"month":1}}
   * 返回: 1
   */
  getObjectAttr(arr, obj){
    let value = obj;
    if(typeof(obj) != "object"){
      return value;
    }
    arr.forEach((item,index)=>{
      value = value[item];
    });
    return value;
  },
}

export default common;
