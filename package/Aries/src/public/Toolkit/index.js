

var Toolkit = {

  // 计算某年某月共多少天
  calcMonthDays(date){
    if (date){
      date = new Date(date)
    } else {
      date = new Date()
    }
    let biggerDays = 0
    while ( date.getMonth() == new Date(date.getTime()+biggerDays*24*60*60*1000).getMonth() ){
      biggerDays += 1
    }
    let smallerDays = 0
    while ( date.getMonth() == new Date(date.getTime()-smallerDays*24*60*60*1000).getMonth() ){
      smallerDays += 1
    }
    return biggerDays+smallerDays-1
  },

  // 传入开始时间字符串，计算出开始时间距离现在大约多长时间
  calcAge(createTime){
    if ( !createTime ){
      return ''
    }
    let seconds = (new Date() - new Date(createTime))/1000
    if ( seconds < 60 ){
      return Math.round(seconds)+'秒'
    } else if ( seconds < 60*60 ){
      return Math.round(seconds/60)+'分钟'
    } else if ( seconds < 24*60*60 ){
      return Math.round(seconds/60/60)+'小时'
    } else {
      return Math.round(seconds/60/60/24)+'天'
    }
  },


  /**
   * 对 oriValue 进行单位转换
   * oriValue(int)                原始数据值
   * base(int)                     进制（比如10、1024）
   * unitArr(Array)               单位字符串列表，如 ['B','KB','MB','GB','TB',]
   * significantFractionBit(int)  有效小数位位数
   */
  unitConversion:function( oriValue,base,unitArr,significantFractionBit ){
    let value = oriValue
    let unitIndex = 0
    while (1){
      if ( value < base ){     // 如果当前值小于base，则说明无需再进行进制转换
        break
      }
      if ( unitIndex >= unitArr.length-1 ){       // 如果发现提供的单位不够，则亦不会继续转换下去
        break
      }
      
      value = value / base
      unitIndex += 1
    }
    if (significantFractionBit){
      value = value.toFixed( significantFractionBit )
    }
    return this.strFormatter.formatString( '{value} {unit}',{ 'value':value,'unit':unitArr[unitIndex] } )
  },

  /**
   * 根据给定的毫秒数，将其对应的日期转换成字符串，格式为  YYYY-MM-DDTHH:mm:SS
   * 如果milliseconds传入-1，则将其视为最新时间对应的毫秒数
   */
  generateTimeStrByMilliSeconds(milliseconds){
    function _f(v){  return v < 10 ? '0'+v : ''+v  }

    let d = (milliseconds === -1) ? new Date() : new Date( milliseconds )
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

