

var Toolkit = {

  /**
   * 根据给定的秒数，将其对应的日期转换成字符串，格式为  YYYY-MM-DDTHH:mm:SS
   * 如果seconds传入-1，则将其视为最新时间对应的秒数
   */
  generateTimeStrBySeconds(seconds){
    function _f(v){  return v < 10 ? '0'+v : ''+v  }

    let d = (seconds === -1) ? new Date() : new Date( seconds )
    let s = _f(d.getFullYear()) + '-' +
            _f(d.getMonth()+1) + '-' +
            _f(d.getDate())  + 'T' +
            _f(d.getHours()) + ':' +
            _f(d.getMinutes()) + ':' +
            _f(d.getSeconds())
    return s
  },

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

  /**
   * 计算 value1、value2 的大小，并根据它们的大小返回相应的字符串，支持int、string类型，但要求它们的类型相同
   * 如果 value1 小于等于 value2 ，则它们为正序，返回 ascSortedStr
   * 如果 value2 大于 value2 ，则它们为倒序，返回 descSortedStr
   * */
  calcValueSort( value1,value2,ascSortedStr = 'asc',descSortedStr = 'desc' ){
    if ( typeof value1 === 'number' ){
      return (value1 <= value2) ? ascSortedStr : descSortedStr
    } else if ( typeof value1 === 'string' ){
      return (value1.localeCompare(value2) <= 0) ? ascSortedStr : descSortedStr
    } else {
      return ''
    }
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

