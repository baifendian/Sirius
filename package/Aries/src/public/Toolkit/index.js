

var Toolkit = {
  generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  },

  getRandomNum(Min,Max){   
    let Range = Max - Min;   
    let Rand = Math.random();   
    return(Min + Math.round(Rand * Range));   
  },

  checkSubStrInStr( str,subStr ){
    return str.match(subStr) !== null
  },

  /*
  strFormatter 是专门用来对js的字符串进行格式化的，以下是使用方法
      var template="我是{name}，今年{age}了";
      var result=strFormatter.formatString( template,{name:"loogn",age:22} );
  */
  strFormatter : {
    replaceAll( templateStr,exp,newStr ) {
  	  return templateStr.replace( new RegExp(exp, "gm"), newStr )
    },
    formatString( templateStr,formatInfoDict ) {
      let result = templateStr
      for (let k in formatInfoDict){
        let v = formatInfoDict[k]
        if (undefined != v){
          result = this.replaceAll( result,"\\{"+k+"\\}", v);
        }
      }
      return result
    }
  }

}

export default Toolkit

